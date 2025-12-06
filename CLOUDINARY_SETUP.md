# Cloudinary Image Upload Setup Guide

## Overview
Your application now supports cloud-based image uploads for:
- **Services** - Service images stored in `services/` folder
- **Vehicles** - Vehicle photos stored in `vehicles/` folder

## Get Cloudinary Credentials

### Step 1: Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. After login, go to [Dashboard](https://cloudinary.com/console)
2. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Update .env File
Add these credentials to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API Endpoints

### Upload Service Image
**Endpoint:** `POST /service/:id/upload-image`
- **Auth Required:** Yes (Admin only)
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `image` field

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/service/SERVICE_ID/upload-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Example using Postman:**
1. Select POST method
2. Enter URL: `http://localhost:3000/service/SERVICE_ID/upload-image`
3. Go to Headers tab, add: `Authorization: Bearer YOUR_JWT_TOKEN`
4. Go to Body tab
5. Select "form-data"
6. Add key "image" with type "File"
7. Choose your image file
8. Click Send

### Upload Vehicle Photo
**Endpoint:** `POST /vehicles/:id/photo`
- **Auth Required:** Yes (User role)
- **Content-Type:** `multipart/form-data`
- **Body:** Form data with `photo` field

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/vehicles/VEHICLE_ID/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

**Example using Postman:**
1. Select POST method
2. Enter URL: `http://localhost:3000/vehicles/VEHICLE_ID/photo`
3. Go to Headers tab, add: `Authorization: Bearer YOUR_JWT_TOKEN`
4. Go to Body tab
5. Select "form-data"
6. Add key "photo" with type "File"
7. Choose your image file
8. Click Send

## Frontend Integration

### React Native / Expo Example
```javascript
import * as ImagePicker from 'expo-image-picker';

async function uploadServiceImage(serviceId, token) {
  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('image', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'service-image.jpg',
    });

    const response = await fetch(
      `http://localhost:3000/service/${serviceId}/upload-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    return data;
  }
}

async function uploadVehiclePhoto(vehicleId, token) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 1,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('photo', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'vehicle-photo.jpg',
    });

    const response = await fetch(
      `http://localhost:3000/vehicles/${vehicleId}/photo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    return data;
  }
}
```

### React Web Example
```javascript
async function handleServiceImageUpload(serviceId, file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `http://localhost:3000/service/${serviceId}/upload-image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return await response.json();
}

async function handleVehiclePhotoUpload(vehicleId, file, token) {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(
    `http://localhost:3000/vehicles/${vehicleId}/photo`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return await response.json();
}

// Usage in component
function ImageUploader() {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const result = await handleServiceImageUpload(serviceId, file, token);
    console.log('Uploaded:', result);
  };

  return <input type="file" accept="image/*" onChange={handleFileChange} />;
}
```

## Response Format

### Service Image Upload Response
```json
{
  "_id": "service_id",
  "name": "Premium Wash",
  "description": "Full service wash",
  "price": 50,
  "imageUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/services/abcd1234.jpg",
  "cloudinaryPublicId": "services/abcd1234",
  "createdAt": "2025-12-05T...",
  "updatedAt": "2025-12-05T..."
}
```

### Vehicle Photo Upload Response
```json
{
  "photoUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/vehicles/xyz789.jpg",
  "vehicle": {
    "id": "vehicle_id",
    "plateNumber": "ABC-123",
    "vehicleType": "sedan",
    "photo": "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/vehicles/xyz789.jpg",
    "cloudinaryPublicId": "vehicles/xyz789",
    ...
  }
}
```

## Database Schema

### Service Entity
- `imageUrl`: Full Cloudinary URL to the image
- `cloudinaryPublicId`: Cloudinary public ID for deletion/updates
- `image`: Legacy field (kept for backward compatibility)

### Vehicle Entity
- `photo`: Cloudinary URL to the vehicle photo
- `cloudinaryPublicId`: Cloudinary public ID for deletion/updates

## Image Management

### Supported Formats
- JPEG/JPG
- PNG
- WebP
- GIF

### File Size Limits
- Default Multer limit: 10MB
- Cloudinary free tier: 10MB per image

### Image Optimization
Cloudinary automatically:
- Optimizes image quality
- Converts to best format
- Generates responsive sizes
- Provides CDN delivery

### Image Transformations
You can transform images on-the-fly by modifying the URL:
```
// Original
https://res.cloudinary.com/cloud_name/image/upload/v123/services/abc.jpg

// Resize to 300x200
https://res.cloudinary.com/cloud_name/image/upload/w_300,h_200/services/abc.jpg

// Thumbnail with crop
https://res.cloudinary.com/cloud_name/image/upload/w_150,h_150,c_thumb/services/abc.jpg
```

## Troubleshooting

### "Cloudinary credentials not configured"
- Check that all three environment variables are set in `.env`
- Restart your server after updating `.env`

### "File too large"
- Check file size (must be under 10MB)
- Consider resizing image before upload

### "Invalid file type"
- Only image files are supported
- Check file extension (.jpg, .png, .gif, .webp)

### "Upload failed"
- Verify Cloudinary credentials are correct
- Check internet connection
- Ensure Cloudinary account is active

## Security Considerations

1. **API Keys**: Never commit `.env` file to version control
2. **File Validation**: Only images are accepted
3. **Authentication**: All upload endpoints require valid JWT token
4. **Authorization**: Service uploads require Admin role, Vehicle uploads require User role
5. **Public Access**: Images are publicly accessible via Cloudinary URLs

## Next Steps

1. Sign up for Cloudinary account
2. Get your credentials from dashboard
3. Update `.env` file with credentials
4. Restart your server
5. Test image upload with Postman or cURL
6. Integrate with your frontend application

## Cloudinary Dashboard

Access your Cloudinary dashboard at: https://cloudinary.com/console

Here you can:
- View all uploaded images
- Organize images into folders
- Set up transformations
- Monitor usage and bandwidth
- Configure upload presets
