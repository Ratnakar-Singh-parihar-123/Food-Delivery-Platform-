// pages/admin/BakeriesList.jsx
import React from "react";
import { Container } from "@mui/material";
import VendorListByType from "../../adminPanel/components/VendorListByType";

const BakeriesList = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <VendorListByType
        businessType="bakery"
        title="Bakeries"
        subtitle="Manage all bakery vendors"
      />
    </Container>
  );
};

export default BakeriesList;
