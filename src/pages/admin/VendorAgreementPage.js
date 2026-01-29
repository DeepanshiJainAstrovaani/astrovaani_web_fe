import React, { useState, useEffect } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import styles from './VendorAgreementPage.module.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VendorAgreementPage = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAgreementContent();
    }, []);

    const fetchAgreementContent = async () => {
        try {
            setFetchingData(true);
            const response = await fetch(`${API_BASE_URL}/vendor-agreement`);
            const data = await response.json();

            if (data.success && data.data.content) {
                const contentBlock = htmlToDraft(data.data.content);
                if (contentBlock) {
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    const newEditorState = EditorState.createWithContent(contentState);
                    setEditorState(newEditorState);
                }
            }
        } catch (error) {
            console.error('Error fetching agreement:', error);
            setMessage('Failed to load agreement content');
        } finally {
            setFetchingData(false);
        }
    };

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const handleUpdate = async () => {
        // Convert editor content to HTML
        const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        
        // Remove HTML tags to check if there's actual content
        const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
        if (!textContent) {
            setMessage('Agreement text cannot be empty');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/vendor-agreement`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: htmlContent })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update');
            }

            setMessage('Agreement updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating agreement:', error);
            setMessage(error.message || 'Failed to update agreement');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className={styles['admin-container']}>
                <h2>Vendor Onboarding Agreement</h2>
                <div className={styles['agreement-card']}>
                    <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Loading agreement content...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['admin-container']}>
            <h2>Vendor Onboarding Agreement</h2>

            <div className={styles['agreement-card']}>
                <Editor
                    editorState={editorState}
                    onEditorStateChange={onEditorStateChange}
                    wrapperClassName={styles['editor-wrapper']}
                    editorClassName={styles['editor-content']}
                    toolbarClassName={styles['editor-toolbar']}
                    placeholder="Text Editor goes here"
                    toolbar={{
                        options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'image', 'history'],
                        inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
                        blockType: { options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'] },
                        fontSize: { options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96] },
                        list: { options: ['unordered', 'ordered'] },
                        textAlign: { options: ['left', 'center', 'right', 'justify'] },
                    }}
                />

                <button
                    className={styles['update-btn']}
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update'}
                </button>

                {message && (
                    <div className={`${styles['message']} ${message.includes('success') ? styles['success'] : styles['error']}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorAgreementPage;

