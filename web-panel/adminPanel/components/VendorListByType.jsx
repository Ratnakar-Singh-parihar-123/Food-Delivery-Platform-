// components/admin/VendorListByType.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Paper,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  Skeleton,
  useTheme,
  alpha,
  Fade,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon2,
  Circle as CircleIcon,
} from "@mui/icons-material";
import {
  getAllVendorsApi,
  blockVendorApi,
  unblockVendorApi,
} from "../../src/api/adminApi";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ─── Image URL Helper ──────────────────────────────────────
const STATIC_BASE =
  import.meta.env?.VITE_STATIC_BASE || "http://localhost:9000";

const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${STATIC_BASE}${clean}`;
};

// ─── Vendor Detail Modal ──────────────────────────────────
const VendorDetailModal = ({ open, vendor, onClose, onBlock, onUnblock }) => {
  const theme = useTheme();
  if (!vendor) return null;

  const imageUrl = buildImageUrl(vendor.profileImage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: "blur(16px)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
          boxShadow: `0 24px 80px ${alpha(theme.palette.common.black, 0.2)}`,
        },
      }}
    >
      {/* Gradient Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          p: 3,
          pb: 2,
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: alpha(theme.palette.common.white, 0.08),
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                vendor.isOnline ? (
                  <CircleIcon sx={{ color: "#4caf50", fontSize: 18 }} />
                ) : (
                  <CircleIcon sx={{ color: "#9e9e9e", fontSize: 18 }} />
                )
              }
            >
              <Avatar
                src={imageUrl}
                alt={vendor.businessName}
                sx={{
                  width: 64,
                  height: 64,
                  border: "3px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                }}
              >
                {vendor.businessName?.charAt(0)}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">
                {vendor.businessName}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.85)">
                {vendor.businessType} • {vendor.ownerFirstName}{" "}
                {vendor.ownerLastName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.8)" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            >
              Contact Information
            </Typography>
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{vendor.email}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{vendor.phone}</Typography>
              </Box>
              {vendor.address && (
                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <LocationIcon
                    fontSize="small"
                    color="action"
                    sx={{ mt: 0.5 }}
                  />
                  <Typography variant="body2">
                    {vendor.address.addressLine}
                    {vendor.address.landmark && `, ${vendor.address.landmark}`}
                    {vendor.address.city && `, ${vendor.address.city}`}
                    {vendor.address.state && `, ${vendor.address.state}`}
                    {vendor.address.pincode && ` - ${vendor.address.pincode}`}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            >
              Performance
            </Typography>
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {vendor.totalOrders || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ₹{vendor.totalEarnings || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {vendor.rating ? `${vendor.rating} ⭐` : "N/A"}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Commission
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {vendor.commissionPercentage || 0}%
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={vendor.isActive ? "Active" : "Blocked"}
                  color={vendor.isActive ? "success" : "error"}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Stack>
          </Grid>

          {vendor.description && (
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
              >
                About
              </Typography>
              <Typography variant="body2">{vendor.description}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<CloseIcon />}>
          Close
        </Button>
        {vendor.isActive ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            onClick={() => onBlock(vendor._id)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Block Vendor
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<UnblockIcon />}
            onClick={() => onUnblock(vendor._id)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Unblock Vendor
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ──────────────────────────────────────────
const VendorListByType = ({ businessType, title, subtitle }) => {
  const theme = useTheme();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        businessType,
        page: page + 1,
        limit: rowsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const res = await getAllVendorsApi(params);
      setVendors(res.data?.vendors || res.vendors || []);
      setTotal(res.data?.total || res.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [businessType, page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleBlock = async (id, reason = "") => {
    try {
      await blockVendorApi(id, reason);
      toast.success("Vendor blocked successfully");
      fetchVendors();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block vendor");
    }
  };

  const handleUnblock = async (id) => {
    try {
      await unblockVendorApi(id);
      toast.success("Vendor unblocked successfully");
      fetchVendors();
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock vendor");
    }
  };

  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVendor(null);
  };

  const handleRowClick = (vendor) => {
    handleView(vendor);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ─── Stats ─────────────────────────────────────────────────
  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.isActive).length,
    online: vendors.filter((v) => v.isOnline).length,
    blocked: vendors.filter((v) => !v.isActive).length,
  };

  // ─── Skeleton ──────────────────────────────────────────────
  const SkeletonRow = () => (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}>
          <Skeleton variant="text" height={30} />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: "blur(12px)",
          boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.05)}`,
          overflow: "hidden",
          transition: "box-shadow 0.2s",
          "&:hover": {
            boxShadow: `0 12px 60px ${alpha(theme.palette.common.black, 0.08)}`,
          },
        }}
      >
        {/* ─── Stats Bar ────────────────────────────────────── */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          sx={{
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <StoreIcon2 color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight="600">
              {stats.total} {businessType} vendors
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="success" fontSize="small" />
            <Typography variant="body2" fontWeight="500" color="success.main">
              {stats.online} online
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} ml="auto">
            <Chip
              label={`${stats.active} active`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${stats.blocked} blocked`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* ─── Header ────────────────────────────────────────── */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle || `All ${businessType} vendors`}
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.common.white, 0.8),
                backdropFilter: "blur(4px)",
                width: { xs: "100%", sm: 260 },
              },
            }}
          />
        </Box>

        {/* ─── Table ─────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(rowsPerPage)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : vendors.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary">
              No {businessType} vendors found.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead
                  sx={{
                    bgcolor: alpha(theme.palette.primary.light, 0.06),
                    "& th": {
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Business</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {vendors.map((vendor, index) => {
                      const imageUrl = buildImageUrl(vendor.profileImage);
                      const rowNumber = page * rowsPerPage + index + 1;
                      return (
                        <motion.tr
                          key={vendor._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25, delay: index * 0.04 }}
                          style={{
                            display: "table-row",
                            transition: "background 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={() => handleRowClick(vendor)}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = alpha(
                              theme.palette.primary.light,
                              0.08,
                            ))
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {rowNumber}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar
                                src={imageUrl}
                                alt={vendor.businessName}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  border: `2px solid ${alpha(
                                    theme.palette.primary.main,
                                    0.15,
                                  )}`,
                                }}
                              >
                                {vendor.businessName?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="600">
                                  {vendor.businessName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {vendor.businessType}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {vendor.ownerFirstName} {vendor.ownerLastName}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {vendor.email}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {vendor.phone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <Chip
                                label={vendor.isOnline ? "Online" : "Offline"}
                                color={vendor.isOnline ? "success" : "default"}
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                              />
                              {!vendor.isActive && (
                                <Chip
                                  label="Blocked"
                                  color="error"
                                  size="small"
                                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(vendor);
                                }}
                                sx={{
                                  color: theme.palette.info.main,
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.info.main,
                                      0.1,
                                    ),
                                  },
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {vendor.isActive ? (
                              <Tooltip title="Block Vendor">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlock(vendor._id);
                                  }}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.1,
                                      ),
                                    },
                                  }}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Unblock Vendor">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnblock(vendor._id);
                                  }}
                                  sx={{
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.success.main,
                                        0.1,
                                      ),
                                    },
                                  }}
                                >
                                  <UnblockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                mt: 1,
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                  },
              }}
            />
          </>
        )}
      </Paper>

      {/* ─── Vendor Detail Modal ────────────────────────────── */}
      <VendorDetailModal
        open={modalOpen}
        vendor={selectedVendor}
        onClose={handleCloseModal}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />
    </>
  );
};

export default VendorListByType;
