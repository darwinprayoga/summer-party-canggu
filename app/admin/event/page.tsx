"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  QrCode,
  UserCheck,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft,
  Scan,
  AlertCircle,
  Search,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QRScanner from "@/components/QRScanner";
import Link from "next/link";

interface CheckedInUser {
  userId: string;
  fullName: string;
  instagram: string;
  checkedInAt: string;
}

interface CheckInStats {
  totalRSVP: number;
  totalCheckedIn: number;
  checkInRate: string;
}

interface CheckInResponse {
  success: boolean;
  message: string;
  data?: CheckedInUser;
}

interface CheckInListResponse {
  success: boolean;
  data?: {
    checkedInUsers: CheckedInUser[];
    stats: CheckInStats;
    pagination?: {
      totalPages: number;
      totalUsers: number;
      currentPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export default function AdminEventPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [checkedInUsers, setCheckedInUsers] = useState<CheckedInUser[]>([]);
  const [stats, setStats] = useState<CheckInStats>({
    totalRSVP: 0,
    totalCheckedIn: 0,
    checkInRate: "0"
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCheckedInUsers();
  }, [currentPage, searchTerm]); // Reload when page or search changes

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  };

  const loadCheckedInUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in as admin first');
        return;
      }

      // Build URL with pagination and search parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/checkin?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result: CheckInListResponse = await response.json();

      if (result.success && result.data) {
        setCheckedInUsers(result.data.checkedInUsers);
        setStats(result.data.stats);

        // Update pagination info if available
        if (result.data.pagination) {
          setTotalPages(result.data.pagination.totalPages);
          setTotalUsers(result.data.pagination.totalUsers);
        }
      } else {
        toast.error('Failed to load check-in data');
      }
    } catch (error) {
      console.error('Error loading checked-in users:', error);
      toast.error('Failed to load check-in data');
    }
  };

  const startScanner = () => {
    setIsScanning(true);
  };

  const stopScanner = () => {
    setIsScanning(false);
  };

  const handleScan = (result: string) => {
    console.log('🔍 QR Code scanned:', result);

    let userIdToCheck = result;

    // Extract User ID from QR data if it's a URL or complex format
    if (result.includes("SP")) {
      const match = result.match(/SP\d+/);
      if (match) {
        userIdToCheck = match[0];
      }
    }

    console.log('📝 Extracted User ID:', userIdToCheck);
    handleCheckIn(userIdToCheck);
    setIsScanning(false); // Close scanner after successful scan
  };

  const handleScanError = (error: Error) => {
    console.error('QR Scanner error:', error);
    toast.error('QR scanner error: ' + error.message);
  };

  const handleCheckIn = async (userId: string) => {
    if (!userId.trim()) {
      toast.error('Please enter a valid User ID');
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in as admin first');
        return;
      }

      const response = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId.trim() })
      });

      const result: CheckInResponse = await response.json();

      if (result.success && result.data) {
        toast.success(`${result.data.fullName} checked in successfully!`);
        setQrInput("");
        loadCheckedInUsers(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to check in user');
      }
    } catch (error) {
      console.error('Error checking in user:', error);
      toast.error('Failed to check in user');
    } finally {
      setLoading(false);
    }
  };

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // For table display, we don't need filtering since backend handles it
  const displayedUsers = checkedInUsers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="self-start text-charcoal hover:text-coral">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal">Event Check-In</h1>
                <p className="text-sm sm:text-base text-charcoal/70">Scan QR codes to check in event attendees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-teal" />
              <h3 className="text-sm font-medium text-charcoal">Total RSVP</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-charcoal">{stats.totalRSVP}</div>
            <p className="text-xs text-charcoal/70">People registered</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-5 w-5 text-lime" />
              <h3 className="text-sm font-medium text-charcoal">Checked In</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-lime">{stats.totalCheckedIn}</div>
            <p className="text-xs text-charcoal/70">Currently at event</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-coral" />
              <h3 className="text-sm font-medium text-charcoal">Check-In Rate</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-coral">{stats.checkInRate}%</div>
            <p className="text-xs text-charcoal/70">Attendance rate</p>
          </div>
        </div>

        {/* Check-In Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* QR Scanner/Manual Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="w-6 h-6 text-coral" />
              <h3 className="text-xl font-semibold text-charcoal">Check-In Scanner</h3>
            </div>
            <div className="space-y-4">
              {!isScanning ? (
                <div className="space-y-4">
                  <button
                    onClick={startScanner}
                    className="w-full bg-teal text-white px-6 py-3 rounded-xl hover:bg-teal/90 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
                    Start QR Scanner
                  </button>

                  <div className="text-center text-xs sm:text-sm text-charcoal/70">
                    OR
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium text-charcoal">Manual User ID Entry:</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Enter User ID (e.g., SP123456)"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCheckIn(qrInput)}
                        className="flex-1 border-gray-200 rounded-lg"
                      />
                      <button
                        onClick={() => handleCheckIn(qrInput)}
                        disabled={loading || !qrInput.trim()}
                        className="w-full sm:w-auto bg-coral text-white px-6 py-2 rounded-lg font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Checking...' : 'Check In'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden h-64 flex items-center justify-center">
                    <div className="text-white text-center">
                      <QrCode className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-base">Click "Start QR Scanner" to begin scanning</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={stopScanner}
                      className="w-full sm:flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Stop Scanner
                    </button>
                    <div className="flex flex-col sm:flex-row gap-2 sm:flex-2">
                      <Input
                        placeholder="Or type User ID here"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCheckIn(qrInput)}
                        className="flex-1 border-gray-200 rounded-lg"
                      />
                      <button
                        onClick={() => handleCheckIn(qrInput)}
                        disabled={loading || !qrInput.trim()}
                        className="w-full sm:w-auto bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Check-Ins */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-teal" />
              <h3 className="text-xl font-semibold text-charcoal">Recent Check-Ins</h3>
            </div>
            <div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {checkedInUsers.slice(0, 5).map((user) => (
                  <div key={user.userId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-lime/10 border border-lime/20 rounded-lg gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base text-charcoal truncate">{user.fullName}</div>
                      <div className="text-xs sm:text-sm text-charcoal/70 truncate">{user.instagram}</div>
                    </div>
                    <div className="flex flex-row sm:flex-col sm:text-right gap-2 sm:gap-1 items-center sm:items-end">
                      <span className="bg-lime text-white text-xs px-2 py-1 rounded-full font-medium">
                        {user.userId}
                      </span>
                      <div className="text-xs text-charcoal/70 whitespace-nowrap">
                        {new Date(user.checkedInAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {checkedInUsers.length === 0 && (
                  <div className="text-center text-charcoal/70 py-8">
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                    <p className="text-sm">No check-ins yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All Check-Ins Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-coral" />
              <h3 className="text-xl font-semibold text-charcoal">All Checked-In Users ({totalUsers})</h3>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 flex-shrink-0 text-charcoal/70" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full sm:w-64 border-gray-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {displayedUsers.map((user) => (
                <div key={user.userId} className="p-4 bg-lime/10 border border-lime/20 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-coral text-white text-xs px-2 py-1 rounded-full font-medium">{user.userId}</span>
                    <span className="bg-lime text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Checked In
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-charcoal">{user.fullName}</div>
                    <div className="text-sm text-charcoal/70">{user.instagram}</div>
                  </div>
                  <div className="text-xs text-charcoal/70">
                    {new Date(user.checkedInAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {displayedUsers.length === 0 && (
                <div className="text-center text-charcoal/70 py-8">
                  <p className="text-sm">
                    {searchTerm ? 'No users match your search' : 'No users checked in yet'}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-charcoal">User ID</TableHead>
                    <TableHead className="text-xs font-semibold text-charcoal">Full Name</TableHead>
                    <TableHead className="text-xs font-semibold text-charcoal">Instagram</TableHead>
                    <TableHead className="text-xs font-semibold text-charcoal">Check-In Time</TableHead>
                    <TableHead className="text-xs font-semibold text-charcoal">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <span className="bg-coral text-white text-xs px-2 py-1 rounded-full font-medium">{user.userId}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-charcoal">{user.fullName}</TableCell>
                      <TableCell className="text-sm text-charcoal/70">{user.instagram}</TableCell>
                      <TableCell className="text-sm text-charcoal/70">
                        {new Date(user.checkedInAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="bg-lime text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Checked In
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {displayedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-charcoal/70 py-8">
                        <p className="text-sm">
                          {searchTerm ? 'No users match your search' : 'No users checked in yet'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-charcoal/70">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-white/80 border border-gray-200 px-3 py-2 rounded-lg text-charcoal hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-coral text-white'
                              : 'bg-white/80 border border-gray-200 text-charcoal hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-white/80 border border-gray-200 px-3 py-2 rounded-lg text-charcoal hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isScanning}
        onScan={handleScan}
        onClose={() => setIsScanning(false)}
      />
    </div>
  );
}