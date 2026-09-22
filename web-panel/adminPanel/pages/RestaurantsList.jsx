// pages/admin/RestaurantsList.jsx
import React from "react";
import { Box, Container } from "@mui/material";
import VendorListByType from "../../adminPanel/components/VendorListByType";

const RestaurantsList = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <VendorListByType
        businessType="restaurant"
        title="Restaurants"
        subtitle="Manage all restaurant vendors"
      />
    </Container>
  );
};

export default RestaurantsList;
