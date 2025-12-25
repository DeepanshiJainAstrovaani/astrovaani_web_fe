import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './AdminTable.module.css';
// Lightweight in-component notification to avoid external toast lib incompatibility in dev
const useNotification = () => {
  const [notification, setNotification] = React.useState(null);
  const show = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };
  return [notification, show];
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GENDERS = ["Male", "Female", "Other"];
const ACCOUNT_STATUS = ["inreview", "active", "inactive", "inprocess"];

const EditVendor = () => {
  const { id } = useParams();
  const [notification, showNotification] = useNotification();
  const [vendor, setVendor] = useState(null);
  const [photos, setPhotos] = useState([null, null, null, null, null]);
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    state: '',
    city: '',
    phone: '',
    whatsapp: '',
    email: '',
    pincode: '',
    age: '',
    experience: '',
    skills: '',
    language: '',
    availability: '',
    accountholder: '',
    accountno: '',
    ifsc: '',
    priceperminute: '',
    '15minrate': '',
    '25minrate': '',
    '30minrate': '',
    '45minrate': '',
    '1hourrate': '',
    '90minrate': '',
    status: '',
    category: '',
    pricingtype: 'PAID' // NEW FIELD
  });
  const [errors, setErrors] = useState({});
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  // Fetch states from API
  useEffect(() => {
    console.log('Fetching states from API...');
    // Use the states endpoint instead of countries endpoint
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        console.log('States API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('States API data received');
        if (data && data.data && Array.isArray(data.data)) {
          console.log('Total entries in response:', data.data.length);
          // Find India entry
          let indiaData = data.data.find(c => c.name === 'India' || c.country === 'India');
          console.log('India data found:', !!indiaData);
          if (indiaData) {
            console.log('India object structure:', Object.keys(indiaData));
            if (indiaData.states && Array.isArray(indiaData.states)) {
              const states = indiaData.states.map(s => {
                // Handle both string and object formats
                if (typeof s === 'string') return s;
                if (s.name) return s.name;
                if (s.state) return s.state;
                return s;
              }).filter(s => s && typeof s === 'string').sort();
              console.log('Extracted states count:', states.length);
              console.log('First few states:', states.slice(0, 5));
              setStateOptions(states);
            } else {
              console.warn('No states array found in India data');
            }
          } else {
            console.warn('India not found in response');
          }
        }
      })
      .catch(err => {
        console.error('Error fetching states:', err);
        // Fallback to countries endpoint if states endpoint fails
        console.log('Falling back to countries endpoint...');
        fetch('https://countriesnow.space/api/v0.1/countries', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.data && Array.isArray(data.data)) {
              let indiaData = data.data.find(c => c.country === 'India');
              if (indiaData && indiaData.states && Array.isArray(indiaData.states)) {
                const states = indiaData.states.map(s => {
                  if (typeof s === 'string') return s;
                  if (s.name) return s.name;
                  return s;
                }).filter(s => s && typeof s === 'string').sort();
                console.log('Fallback states extracted:', states.length);
                setStateOptions(states);
              }
            }
          })
          .catch(fallbackErr => {
            console.error('Fallback also failed:', fallbackErr);
            setStateOptions([]);
          });
      });
  }, []);

  useEffect(() => {
    // Fetch vendor details
    const fetchVendor = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/vendors/${id}`);
        if (!response.ok) throw new Error('Failed to fetch vendor');
        const data = await response.json();
        console.log('Vendor data fetched:', data);
        console.log('Vendor state value:', data.state);
        console.log('Vendor city value:', data.city);
        setVendor(data);
        setPhotos([
          data.photo || null,
          data.photo2 || null,
          data.photo3 || null,
          data.photo4 || null,
          data.photo5 || null,
        ]);
        setAbout(data.about || '');
        console.log('Setting form state with vendor data:', {
          gender: data.gender,
          state: data.state,
          city: data.city,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          pincode: data.pincode,
          accountno: data.accountno,
          ifsc: data.ifsc,
          status: data.status,
          category: data.category
        });
        setForm({
          name: data.name || '',
          gender: data.gender || '',
          state: data.state || '',
          city: data.city || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          pincode: data.pincode || '',
          age: data.age || '',
          experience: data.experience || '',
          skills: data.skills || '',
          language: data.language || '',
          availability: data.availability || '',
          accountholder: data.accountholder || '',
          accountno: data.accountno || '',
          ifsc: data.ifsc || '',
          priceperminute: data.priceperminute || '',
          '15minrate': data['15minrate'] || '',
          '25minrate': data['25minrate'] || '',
          '30minrate': data['30minrate'] || '',
          '45minrate': data['45minrate'] || '',
          '1hourrate': data['1hourrate'] || '',
          '90minrate': data['90minrate'] || '',
          status: data.status || '',
          category: data.category || '',
          pricingtype: data.pricingtype || 'PAID' // NEW FIELD
        });
        
        // If vendor has a state, make sure it's in the options and fetch cities
        if (data.state) {
          console.log('Vendor has state:', data.state);
          // If state is not in the options, add it
          setStateOptions(prevStates => {
            console.log('prevStates count:', prevStates.length);
            console.log('prevStates:', prevStates);
            if (!prevStates.includes(data.state)) {
              console.log('State not in options, adding it:', data.state);
              const updatedStates = [...prevStates, data.state].sort();
              console.log('Updated states count:', updatedStates.length);
              console.log('Updated states includes vendor state:', updatedStates.includes(data.state));
              return updatedStates;
            }
            console.log('State already in options');
            return prevStates;
          });
          
          console.log('Fetching cities for state:', data.state);
          fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: 'India', state: data.state })
          })
            .then(res => res.json())
            .then(responseData => {
              console.log('Cities response:', responseData);
              if (responseData && responseData.data) {
                console.log('Cities count:', responseData.data.length);
                console.log('Cities set:', responseData.data);
                
                let finalCities = responseData.data;
                
                // If vendor also has a city, ensure it's in the options
                if (data.city) {
                  console.log('Vendor has city:', data.city);
                  if (!responseData.data.includes(data.city)) {
                    console.log('City not in options, adding it:', data.city);
                    finalCities = [...responseData.data, data.city].sort();
                    console.log('Updated cities count:', finalCities.length);
                    console.log('Updated cities includes vendor city:', finalCities.includes(data.city));
                  } else {
                    console.log('City already in options');
                  }
                } else {
                  console.log('No city in vendor data');
                }
                
                // Set cities AFTER ensuring vendor's city is included
                setCityOptions(finalCities);
                console.log('City options set with final cities count:', finalCities.length);
              } else {
                console.warn('No cities data in response');
              }
            })
            .catch((err) => {
              console.error('Error fetching cities:', err);
            });
        }
      } catch (err) {
        console.error('Vendor fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  useEffect(() => {
    console.log('Form state updated:', form);
  }, [form]);

  useEffect(() => {
    console.log('Form state changed:', form.state);
    if (form.state) {
      console.log('Fetching cities for form state:', form.state);
      // Example API: https://countriesnow.space/api/v0.1/countries/state/cities
      fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'India', state: form.state })
      })
        .then(res => res.json())
        .then(data => {
          console.log('Cities fetched for state:', data);
          if (data && data.data) {
            console.log('Setting city options:', data.data);
            setCityOptions(data.data);
          }
          else setCityOptions([]);
        })
        .catch((err) => {
          console.error('Error fetching cities:', err);
          setCityOptions([]);
        });
    } else {
      console.log('No state selected, clearing cities');
      setCityOptions([]);
    }
  }, [form.state]);

  // TinyMCE integration
  useEffect(() => {
    // Define initialization function
    const initializeTinyMCE = () => {
      if (!window.tinymce) {
        console.error('TinyMCE not available');
        return;
      }

      // Check if editor already exists
      const existingEditor = window.tinymce.get('about-editor');
      if (existingEditor) {
        console.log('Editor already exists, setting content');
        existingEditor.setContent(about || '');
        return;
      }

      console.log('Initializing TinyMCE editor with about content:', about);
      
      // Initialize TinyMCE
      window.tinymce.init({
        selector: '#about-editor',
        height: 300,
        menubar: false,
        plugins: [
          'link', 'lists', 'table', 'media', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link',
        setup: (editor) => {
          console.log('TinyMCE editor setup called');
          editor.on('init', () => {
            console.log('TinyMCE editor initialized, setting initial content');
            editor.setContent(about || '');
          });
          editor.on('change', () => {
            const content = editor.getContent();
            console.log('About content changed in TinyMCE:', content);
            setAbout(content);
          });
          editor.on('keyup', () => {
            const content = editor.getContent();
            setAbout(content);
          });
        },
      });
    };

    // Wait a bit to ensure DOM is ready
    const timer = setTimeout(() => {
      // Check if TinyMCE script is already loaded
      if (window.tinymce) {
        console.log('TinyMCE already loaded globally');
        initializeTinyMCE();
        return;
      }

      // Load TinyMCE script
      const script = document.createElement('script');
      script.src = 'https://cdn.tiny.cloud/1/a4ob0c0x3h9xzchnb7nob64s3gqjifkjhirtaap9wp5i26y2/tinymce/8/tinymce.min.js';
      script.referrerPolicy = 'origin';
      script.crossOrigin = 'anonymous';
      script.async = true;
      
      script.onload = () => {
        console.log('TinyMCE script loaded successfully');
        // Small delay to ensure tinymce is ready
        setTimeout(() => {
          initializeTinyMCE();
        }, 100);
      };

      script.onerror = () => {
        console.error('Failed to load TinyMCE script');
      };

      document.head.appendChild(script);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      if (window.tinymce) {
        const editor = window.tinymce.get('about-editor');
        if (editor) {
          editor.remove();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor content when about state changes externally
  useEffect(() => {
    if (window.tinymce) {
      const editor = window.tinymce.get('about-editor');
      if (editor && !editor.isDirty()) {
        console.log('Updating editor content from state:', about);
        editor.setContent(about || '');
      }
    }
  }, [about]);

  const handlePhotoChange = (index, file) => {
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);
  };

  const validate = () => {
    const newErrors = {};
    // Only validate if fields have values - admin can leave fields empty
    if (form.phone && !/^\d{10}$/.test(form.phone)) newErrors.phone = "Enter valid 10-digit phone number";
    if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp)) newErrors.whatsapp = "Enter valid 10-digit WhatsApp number";
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Enter valid 6-digit pincode";
    // Removed bank details validations (accountno and ifsc)
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter valid email address";
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    // Pricing type logic REMOVED: pricingtype now only updates its own field
    if (name === 'pricingtype') {
      setForm(f => ({
        ...f,
        pricingtype: value
      }));
      return;
    }
    // If pricing per minute changes, auto-calculate all duration rates
    if (name === 'priceperminute') {
      const pricePerMin = value === '' ? '' : parseFloat(value);
      if (value === '' || isNaN(pricePerMin)) {
        setForm(f => ({ 
          ...f, 
          [name]: '',
          '15minrate': '',
          '25minrate': '',
          '30minrate': '',
          '45minrate': '',
          '1hourrate': '',
          '90minrate': ''
        }));
      } else {
        setForm(f => ({ 
          ...f, 
          [name]: pricePerMin,
          '15minrate': pricePerMin * 15,
          '25minrate': pricePerMin * 25,
          '30minrate': pricePerMin * 30,
          '45minrate': pricePerMin * 45,
          '1hourrate': pricePerMin * 60,
          '90minrate': pricePerMin * 90
        }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Create FormData to handle both files and text data
      const formData = new FormData();

      // Add form fields
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('gender', form.gender);
      formData.append('state', form.state);
      formData.append('city', form.city);
      formData.append('phone', form.phone);
      formData.append('whatsapp', form.whatsapp);
      formData.append('email', form.email);
      formData.append('pincode', form.pincode);
      formData.append('age', form.age);
      formData.append('experience', form.experience);
      formData.append('skills', form.skills);
      formData.append('language', form.language);
      formData.append('availability', form.availability);
      formData.append('accountholder', form.accountholder);
      formData.append('accountno', form.accountno);
      formData.append('ifsc', form.ifsc);
      formData.append('priceperminute', form.priceperminute);
      formData.append('15minrate', form['15minrate']);
      formData.append('25minrate', form['25minrate']);
      formData.append('30minrate', form['30minrate']);
      formData.append('45minrate', form['45minrate']);
      formData.append('1hourrate', form['1hourrate']);
      formData.append('90minrate', form['90minrate']);
      formData.append('status', form.status);
      formData.append('pricingtype', form.pricingtype); // NEW FIELD
      
      // Debug: Log pricing values before submit
      console.log('💰 Pricing values being submitted:', {
        priceperminute: form.priceperminute,
        '15minrate': form['15minrate'],
        '25minrate': form['25minrate'],
        '30minrate': form['30minrate'],
        '45minrate': form['45minrate'],
        '1hourrate': form['1hourrate'],
        '90minrate': form['90minrate']
      });
      formData.append('about', about);

      // Add new photo files (only if they are File objects, not strings from DB)
      for (let i = 0; i < photos.length; i++) {
        if (photos[i] && photos[i] instanceof File) {
          // For photo, photo2-photo5, use appropriate field names
          const fieldName = i === 0 ? 'photo' : `photo${i + 1}`;
          formData.append(fieldName, photos[i]);
          console.log(`Added ${fieldName} to form data:`, photos[i].name);
        }
      }

      console.log('Submitting vendor update with data:', {
        gender: form.gender,
        state: form.state,
        city: form.city,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        pincode: form.pincode,
        accountno: form.accountno,
        ifsc: form.ifsc,
        status: form.status,
        about: about,
        photosCount: photos.filter(p => p instanceof File).length,
      });

      // Make PUT request to update vendor
      const response = await fetch(`${API_URL}/vendors/${id}`, {
        method: 'PUT',
        body: formData,
        // Note: Don't set Content-Type header, browser will set it automatically with boundary for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vendor');
      }

      const updatedVendor = await response.json();
      console.log('Vendor updated successfully:', updatedVendor);
      // Update local UI state so changes reflect immediately
      setVendor(updatedVendor);
      setPhotos([
        updatedVendor.photo || null,
        updatedVendor.photo2 || null,
        updatedVendor.photo3 || null,
        updatedVendor.photo4 || null,
        updatedVendor.photo5 || null,
      ]);
      setForm({
        name: updatedVendor.name || '',
        gender: updatedVendor.gender || '',
        state: updatedVendor.state || '',
        city: updatedVendor.city || '',
        phone: updatedVendor.phone || '',
        whatsapp: updatedVendor.whatsapp || '',
        email: updatedVendor.email || '',
        pincode: updatedVendor.pincode || '',
        age: updatedVendor.age || '',
        experience: updatedVendor.experience || '',
        skills: updatedVendor.skills || '',
        language: updatedVendor.language || '',
        availability: updatedVendor.availability || '',
        accountholder: updatedVendor.accountholder || '',
        accountno: updatedVendor.accountno || '',
        ifsc: updatedVendor.ifsc || '',
        priceperminute: updatedVendor.priceperminute !== undefined ? updatedVendor.priceperminute : '',
        '15minrate': updatedVendor['15minrate'] !== undefined ? updatedVendor['15minrate'] : '',
        '25minrate': updatedVendor['25minrate'] !== undefined ? updatedVendor['25minrate'] : '',
        '30minrate': updatedVendor['30minrate'] !== undefined ? updatedVendor['30minrate'] : '',
        '45minrate': updatedVendor['45minrate'] !== undefined ? updatedVendor['45minrate'] : '',
        '1hourrate': updatedVendor['1hourrate'] !== undefined ? updatedVendor['1hourrate'] : '',
        '90minrate': updatedVendor['90minrate'] !== undefined ? updatedVendor['90minrate'] : '',
        status: updatedVendor.status || '',
        category: updatedVendor.category || '',
        pricingtype: updatedVendor.pricingtype || 'PAID' // NEW FIELD
      });
      setAbout(updatedVendor.about || '');
      showNotification('success', '✅ Vendor updated successfully!');
      
    } catch (error) {
      console.error('Error updating vendor:', error);
      showNotification('error', `❌ Error updating vendor: ${error.message}`);
    }
  };

  if (loading) return <div>Loading vendor...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!vendor) return <div>Vendor not found.</div>;

  return (
    <div className={styles['admin-container']} style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
          <div style={{ background: notification.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 16px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
            {notification.msg}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 500, textAlign: 'center' }}>{vendor.name}</h1>
        <div className="mb-3" style={{ fontSize: '1rem', color: '#222', textAlign: 'center' }}>Admin Dashboard / {vendor.name}</div>
        <form onSubmit={handleSubmit} style={{ width: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 32, display: 'flex', flexDirection: 'column', gap: 32, boxSizing: 'border-box', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            {/* Profile photo in center, gallery in one row */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
              <img
                src={photos[0] ? (typeof photos[0] === 'string' ? photos[0] : URL.createObjectURL(photos[0])) : null}
                alt="Profile"
                style={{ width: 180, height: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 10, background: '#eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              />
              <label style={{ fontWeight: 600, marginBottom: 8 }}>
                Choose profile photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ marginLeft: 8 }}
                  onChange={e => handlePhotoChange(0, e.target.files[0])}
                />
              </label>
            </div>
            <div className="row" style={{ width: '100%', margin: '0 auto', justifyContent: 'center' }}>
              {[1,2,3,4].map(idx => (
                <div key={idx} className="col-lg-6 col-md-6 col-sm-6 d-flex flex-column align-items-center mb-3">
                  <img
                    src={photos[idx] && typeof photos[idx] === 'string' ? photos[idx] : (photos[idx] ? URL.createObjectURL(photos[idx]) : null)}
                    alt=""
                    style={{ width: 90, height: 110, objectFit: 'cover', borderRadius: 10, marginBottom: 6, background: '#eee', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ marginLeft: 0 }}
                    onChange={e => handlePhotoChange(idx, e.target.files[0])}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Personal Details */}
          <div style={{ background: '#fafafa', padding: 24, borderRadius: 10, marginTop: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', background: '#ffd600', padding: '8px 18px', borderRadius: 4, marginBottom: 18, display: 'inline-block' }}>Personal Details</div>
            <div className="row" style={{}}>
              <div className="col-md-4 mb-3">
                <label>Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Category</label>
                <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                  <option value="">Select</option>
                  {['astrologer','vendor','tarot reader'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label>Gender</label>
                <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gender && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.gender}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label>Phone number</label>
                <input type="text" name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                {errors.phone && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.phone}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label>Whatsapp number</label>
                <input type="text" name="whatsapp" className="form-control" value={form.whatsapp} onChange={handleChange} />
                {errors.whatsapp && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.whatsapp}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label>Email address</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} />
                {errors.email && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.email}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label>Age</label>
                <input type="number" name="age" className="form-control" value={form.age} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Your State</label>
                <select name="state" className="form-control" value={form.state} onChange={handleChange}>
                  <option value="">Select</option>
                  {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label>City</label>
                <select name="city" className="form-control" value={form.city} onChange={handleChange} disabled={!form.state}>
                  <option value="">Select</option>
                  {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label>Pincode</label>
                <input type="text" name="pincode" className="form-control" value={form.pincode} onChange={handleChange} />
                {errors.pincode && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.pincode}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label>Experience</label>
                <input type="text" name="experience" className="form-control" value={form.experience} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Skills</label>
                <input type="text" name="skills" className="form-control" value={form.skills} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Language</label>
                <input type="text" name="language" className="form-control" value={form.language} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Availability</label>
                <input type="text" name="availability" className="form-control" value={form.availability} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Account Status</label>
                <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                  <option value="">Select</option>
                  {ACCOUNT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          {/* Bank Details */}
          <div style={{ background: '#fafafa', borderRadius: 10, marginTop: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', background: '#ffd600', padding: '8px 18px', borderRadius: 4, marginBottom: 18, display: 'inline-block' }}>Bank Details</div>
            <div className="row" style={{ }}>
              <div className="col-md-4 mb-3">
                <label>Account holder name</label>
                <input type="text" name="accountholder" className="form-control" value={form.accountholder} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Account number</label>
                <input type="text" name="accountno" className="form-control" value={form.accountno} onChange={handleChange} />
                {errors.accountno && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.accountno}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label>IFSC</label>
                <input type="text" name="ifsc" className="form-control" value={form.ifsc} onChange={handleChange} />
                {errors.ifsc && <div className="text-danger" style={{ fontSize: '0.95em' }}>{errors.ifsc}</div>}
              </div>
            </div>
          </div>
          {/* Pricing Details */}
          <div style={{ background: '#fafafa', borderRadius: 10, marginTop: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', background: '#ffd600', padding: '8px 18px', borderRadius: 4, marginBottom: 18, display: 'inline-block' }}>Pricing Details</div>
            <div className="row" style={{ }}>
              <div className="col-md-4 mb-3">
                <label>Pricing Type</label>
                <select name="pricingtype" className="form-control" value={form.pricingtype} onChange={handleChange}>
                  <option value="PAID">PAID</option>
                  <option value="FREE">FREE</option>
                </select>
                <small style={{ color: '#666', fontSize: '0.85em', display: 'block', marginTop: '4px' }}>
                  Select FREE to make vendor pricing free after adding offer
                </small>
              </div>
              <div className="col-md-4 mb-3">
                <label>Pricing Per Minute</label>
                <input type="number" name="priceperminute" className="form-control" value={form.priceperminute} onChange={handleChange} />
                <small style={{ color: '#666', fontSize: '0.85em', display: 'block', marginTop: '4px' }}>
                  💡 Other duration prices will be auto-calculated
                </small>
              </div>
              <div className="col-md-4 mb-3">
                <label>15 min</label>
                <input type="number" name="15minrate" className="form-control" value={form['15minrate']} onChange={handleChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label>25 min</label>
                <input type="number" name="25minrate" className="form-control" value={form['25minrate']} onChange={handleChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label>30 min</label>
                <input type="number" name="30minrate" className="form-control" value={form['30minrate']} onChange={handleChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label>45 min</label>
                <input type="number" name="45minrate" className="form-control" value={form['45minrate']} onChange={handleChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label>1 hour</label>
                <input type="number" name="1hourrate" className="form-control" value={form['1hourrate']} onChange={handleChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label>90 min</label>
                <input type="number" name="90minrate" className="form-control" value={form['90minrate']} onChange={handleChange} />
              </div>
            </div>
          </div>
          {/* About Section with TinyMCE */}
          <div style={{ marginTop: 24 }}>
            <label style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 12, display: 'block' }}>About</label>
            <textarea
              id="about-editor"
              defaultValue={about}
              style={{ width: '100%', minHeight: 300, marginTop: 8, borderRadius: 8, border: '1px solid #ccc', padding: 12, fontSize: '1.05rem', background: '#fff', fontFamily: 'Arial, sans-serif' }}
            />
          </div>
          <button type="submit" style={{ background: '#ffd600', color: '#222', fontWeight: 700, fontSize: '1.2rem', border: 'none', borderRadius: 24, padding: '12px 36px', marginTop: 0, cursor: 'pointer', alignSelf: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>Update</button>
        </form>
      </div>
    </div>
  );
};

export default EditVendor;
