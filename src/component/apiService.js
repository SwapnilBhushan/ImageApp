import axios from 'axios';

const apiKey = '6f102c62f41998d151e5a1b48713cf13';

export const fetchRecentImages = async () => {
  try {
    const response = await axios.get(
      `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=${apiKey}&format=json&nojsoncallback=1&extras=url_s`,
    );
    return response.data.photos.photo;
  } catch (error) {
    console.error('Error fetching recent images:', error);
    throw error;
  }
};
