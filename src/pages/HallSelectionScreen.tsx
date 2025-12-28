import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import { LocationOn, People } from '@mui/icons-material';
import { useHallStore } from '../stores/hallStore';

const HallSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { halls, setSelectedHall } = useHallStore();

  const handleSelectHall = (hall: typeof halls[0]) => {
    setSelectedHall(hall);
    navigate(`/hall/${hall.id}`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Select a Hall
      </Typography>
      <Typography color="text.secondary" paragraph>
        Choose a hall to manage bookings and view details.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {halls.map((hall) => (
          <Grid item xs={12} sm={6} md={4} key={hall.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleSelectHall(hall)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {hall.name}
                  </Typography>

                  {hall.shortDescription && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {hall.shortDescription}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {hall.city && (
                      <Chip
                        icon={<LocationOn fontSize="small" />}
                        label={hall.city}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {hall.capacity && (
                      <Chip
                        icon={<People fontSize="small" />}
                        label={`${hall.capacity} guests`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {hall.price && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ₹{hall.price.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per booking
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HallSelectionScreen;
