import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/location', async (req, res) => {
  try {
    const { data } = await axios.get('https://ipapi.co/json/');

    if (!data) {
      return res.status(404).json({ message: 'Location data not found' }); 
    }

    res.json(data); 
  } catch (error) {
    console.error('Error fetching location data:', error);

    if (!res.headersSent) { // ✅ Check before sending another response
      return res.status(500).json({ message: 'Failed to fetch location' });
    }
  }
});

export default router;
