// pages/admin/DhabasList.jsx
import React from "react";
import { Container } from "@mui/material";
import VendorListByType from "../../adminPanel/components/VendorListByType";

const DhabasList = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <VendorListByType
        businessType="dhaba"
        title="Dhabas"
        subtitle="Manage all dhaba vendors"
      />
    </Container>
  );
};

export default DhabasList;
