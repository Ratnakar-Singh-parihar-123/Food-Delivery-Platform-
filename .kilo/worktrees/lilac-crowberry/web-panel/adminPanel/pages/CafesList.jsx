// pages/admin/CafesList.jsx
import React from "react";
import { Container } from "@mui/material";
import VendorListByType from "../../adminPanel/components/VendorListByType";

const CafesList = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <VendorListByType
        businessType="cafe"
        title="Cafes"
        subtitle="Manage all cafe vendors"
      />
    </Container>
  );
};

export default CafesList;
