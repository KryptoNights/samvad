// useGasFees.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useGasFees = () => {
  const [gasFees, setGasFees] = useState(null);
  const Auth = Buffer.from(
    process.env.NEXT_PUBLIC_INFURA_API_KEY + ":" + process.env.NEXT_PUBLIC_INFURA_API_KEY_SECRET,
  ).toString("base64");

  useEffect(() => {
    const fetchGasFees = async () => {
      try {
        const response = await axios.get(
          `https://gas.api.infura.io/networks/1/suggestedGasFees`,
          {
            headers: {
              Authorization: `Basic ${Auth}`,
            },
          }
        );
        setGasFees(response.data);
      } catch (error) {
        console.error('Error fetching gas fees:', error);
        setGasFees(null);
      }
    };

    fetchGasFees();
  }, []);

  return gasFees;
};

export default useGasFees;
