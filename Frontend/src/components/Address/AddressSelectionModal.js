import React, { useEffect, useState, useRef } from 'react';
import { X, Edit, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  IconButton,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';

const AddressSelectionModal = ({ isOpen, onClose, onAddressSelect, AddressForm }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (showAddressForm || editingAddress) {
          setShowAddressForm(false);
          setEditingAddress(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, showAddressForm, editingAddress]);

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getalladdresses`, {
        headers: { token },
      });
      
      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      } else {
        setError('Failed to fetch addresses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching addresses');
      setAddresses([]);
    }
    setLoading(false);
  };

  const handleDeleteAddress = async (addressId) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_URL}/api/customer/address/delete/${addressId}`,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        // Immediately update the local state before fetching
        setAddresses(addresses.filter(addr => addr.address_id !== addressId));
        await fetchAddresses(); // Fetch to ensure sync with server
      } else {
        setError('Failed to delete address');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting address');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateAddress = async (addressId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/api/customer/address/update/${addressId}`,
        updatedData,
        {
          headers: { token },
        }
      );

      if (response.status === 200) {
        setEditingAddress(null);
        await fetchAddresses();
      } else {
        setError('Failed to update address');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Error updating address');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog 
      open={isOpen}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: '16px',
          maxHeight: 'calc(100% - 32px)',
        },
      }}
    >
      <div ref={modalRef}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" component="div">
            {showAddressForm || editingAddress ? (editingAddress ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}
          </Typography>
          <IconButton
            onClick={() => {
              if (showAddressForm || editingAddress) {
                setShowAddressForm(false);
                setEditingAddress(null);
              } else {
                onClose();
              }
            }}
            size="small"
          >
            <X />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {showAddressForm || editingAddress ? (
            <AddressForm 
              initialData={editingAddress}
              onClose={() => {
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              onAddressAdd={fetchAddresses}
              onAddressSelect={onAddressSelect}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                  <Loader2 className="animate-spin" />
                </div>
              ) : addresses.length > 0 ? (
                addresses.map((address) => (
                  <Card
                    key={address.address_id}
                    variant="outlined"
                    sx={{
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.lighter',
                      },
                      transition: 'all 0.2s',
                      opacity: isDeleting ? 0.7 : 1,
                      pointerEvents: isDeleting ? 'none' : 'auto',
                    }}
                  >
                    <CardContent>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div 
                          onClick={() => onAddressSelect(address)}
                          style={{ flex: 1, cursor: 'pointer' }}
                        >
                          <Typography variant="subtitle1">
                            {address.ship_to_name || address.default_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {address.ship_to_phone_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {`${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.pincode}`}
                          </Typography>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                            }}
                            disabled={isDeleting}
                          >
                            <Edit size={20} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.address_id);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No addresses found. Add a new address to continue.
                </Typography>
              )}
              
              <Button
  variant="contained"
  fullWidth
  onClick={() => setShowAddressForm(true)}
  sx={{ mt: 2, bgcolor: 'teal', '&:hover': { bgcolor: 'darkslategray' } }}
  disabled={isDeleting}
>
  Add New Address
</Button>
            </div>
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default AddressSelectionModal;