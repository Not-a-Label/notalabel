import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { EventName, EventCategory } from '@/lib/analytics';

const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    profileImage: '',
    // Add other necessary fields
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save the profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      let profileImageUrl = profileData.profileImage;
      
      // Upload image if one was selected
      if (selectedImage) {
        console.log('Uploading new image to server...');
        const formData = new FormData();
        formData.append('file', selectedImage);
        
        const uploadResponse = await fetch('/api/profile/upload', {
          method: 'POST',
          body: formData,
        });
        
        // Log the full response for debugging
        console.log('Upload response status:', uploadResponse.status);
        const responseText = await uploadResponse.text();
        console.log('Upload response text:', responseText);
        
        // Parse the response if it's JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error('Invalid response from server');
        }
        
        if (!uploadResponse.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }
        
        profileImageUrl = data.imageUrl;
        console.log('Image uploaded successfully, new URL:', profileImageUrl);
      }
      
      // In a real app, we would now update the profile with the new image URL
      // This is a simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the profile data with the new image URL
      const updatedProfile = {
        ...profileData,
        profileImage: profileImageUrl
      };
      
      // In a real app, you would send the updatedProfile to your backend
      console.log('Updated profile data:', updatedProfile);
      
      // For testing: Save profile data to localStorage as a fallback
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
      console.log('Profile saved to localStorage for testing');
      
      // Track the save event
      trackEvent(EventName.PROFILE_UPDATE, EventCategory.USER, {
        status: 'success',
        has_profile_image: !!selectedImage
      });
      
      // Redirect back to profile page
      router.push('/dashboard/profile');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
      
      // Track error
      trackEvent(EventName.PROFILE_UPDATE, EventCategory.USER, {
        status: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default EditProfilePage; 