import React, { useState, useEffect, CSSProperties } from "react";
import { pageContainer, mainContentStyle } from "../styles/layout";
import Navigation from "../../components/common/Navigation";

// ### Type Definitions ###

// Defines the shape for key statistical metrics
interface KeyMetrics {
  totalAssigned: number;
  resolved: number;
  in_progress: number;
  pending: number;
}

// Defines the shape for individual performance metrics
interface PerformanceMetrics {
    responseTime: string;
    resolutionRate: string;
    satisfactionScore: string;
}

// Defines the shape for monthly trend data
interface MonthlyTrend {
    month: string;
    assigned: number;
    resolved: number;
}

// Defines the shape for the detailed performance data object
interface PerformanceData {
    averageResolutionTime: number;
    performanceMetrics: PerformanceMetrics;
    monthlyTrends: MonthlyTrend[];
}


// ### Component ###

const OfficerAnalytics: React.FC = () => {
  const [keyMetrics, setKeyMetrics] = useState<KeyMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllOfficerAnalytics = async () => {
      try {
        const [statsRes, detailsRes] = await Promise.all([
          fetch(
            "https://citizen-grivance-system.onrender.com/api/officer/stats",
            {
              method: "GET",
              credentials: "include",
            }
          ),
          fetch(
            "https://citizen-grivance-system.onrender.com/api/officer/analyticsDetails",
            {
              method: "GET",
              credentials: "include",
            }
          ),
        ]);

        const statsData = await statsRes.json();
        const detailsData = await detailsRes.json();

        if (!statsRes.ok || !detailsRes.ok) {
          // Use a proper notification system in a real app
          alert(
            statsData.message ||
              detailsData.message ||
              "Failed to fetch analytics data"
          );
          return;
        }

        setKeyMetrics(statsData);
        setPerformanceData(detailsData);
      } catch (err) {
        console.error("Error fetching officer analytics:", err);
        alert("Server error. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllOfficerAnalytics();
  }, []);

  // ### Styles ###

  const metricCardStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    flex: 1,
    minWidth: "200px",
  };

  const chartContainerStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginTop: "20px",
  };

  if (loading) {
    return (
      <div style={pageContainer as CSSProperties}>
        <Navigation />
        <div style={mainContentStyle as CSSProperties}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer as CSSProperties}>
      <Navigation />
      <div style={mainContentStyle as CSSProperties}>
        <h1
          style={{
            fontSize: 40,
            fontFamily: "Roboto, sans-serif",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Analytics Dashboard
        </h1>
        <p style={{ fontSize: 16, color: "#6c757d", marginBottom: "30px" }}>
          Track your performance and grievance resolution metrics.
        </p>

        {/* Key Metrics */}
        {keyMetrics && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Total Assigned</h3>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#007bff" }}>{keyMetrics.totalAssigned}</div>
            </div>
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Resolved</h3>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#28a745" }}>{keyMetrics.resolved}</div>
            </div>
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>In Progress</h3>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#ffc107" }}>{keyMetrics.in_progress}</div>
            </div>
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Pending</h3>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#dc3545" }}>{keyMetrics.pending}</div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performanceData && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Avg Resolution Time</h3>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#495057" }}>{performanceData.averageResolutionTime} days</div>
            </div>
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Response Time</h3>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#495057" }}>{performanceData.performanceMetrics.responseTime}</div>
            </div>
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Resolution Rate</h3>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#495057" }}>{performanceData.performanceMetrics.resolutionRate}</div>
            </div>
            <div style={metricCardStyle}>
              <h3 style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>Satisfaction Score</h3>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#495057" }}>{performanceData.performanceMetrics.satisfactionScore}</div>
            </div>
          </div>
        )}

        {/* Monthly Trends */}
        {performanceData && performanceData.monthlyTrends && (
          <div style={chartContainerStyle}>
            <h2 style={{ fontSize: 20, fontFamily: "Roboto, sans-serif", fontWeight: 600, marginBottom: "20px" }}>
              Monthly Trends
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
              {performanceData.monthlyTrends.map((trend, index) => (
                <div key={index} style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>{trend.month}</div>
                  <div style={{ fontSize: "14px", color: "#6c757d" }}>Assigned: {trend.assigned}</div>
                  <div style={{ fontSize: "14px", color: "#6c757d" }}>Resolved: {trend.resolved}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerAnalytics;
