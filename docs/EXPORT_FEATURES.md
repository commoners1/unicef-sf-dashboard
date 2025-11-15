# SF Dashboard Export Features

Last updated: 15 November 2025

## Overview
The SF Dashboard provides comprehensive export functionality across all major features, allowing authorized users to extract insights and data for analysis, reporting, and compliance purposes.

## 📊 Export Capabilities

### 1. **Audit Logs Export** ✅
**Location**: Audit Logs page (`/audit`)
**Formats**: CSV, JSON, XLSX
**Features**:
- Export filtered audit logs with all applied filters
- Custom field selection
- Include metadata (export timestamp, user info)
- Bulk export with pagination support
- Individual log export (JSON format)

**Exportable Data**:
- Log ID, Action, Method, Endpoint
- Status Code, Duration, IP Address
- User information (name, email)
- API Key information
- Request/Response data
- Timestamps and delivery status

### 2. **Queue Management Export** ✅
**Location**: Queue Management page (`/queue`)
**Formats**: CSV, JSON
**Features**:
- Real-time queue status export
- Performance metrics export
- Health status and alerts export
- Historical queue data

**Exportable Data**:
- Queue names and status
- Job counts (waiting, active, completed, failed, delayed)
- Health status and processing rates
- Performance metrics (throughput, avg processing time)
- System alerts and warnings

### 3. **Cron Jobs Export** ✅
**Location**: Cron Jobs page (`/cron-jobs`)
**Formats**: CSV, JSON
**Features**:
- Export undelivered cron jobs
- Filter by job type and status
- Include user and API key information
- Bulk selection and export

**Exportable Data**:
- Job ID, Action, Endpoint, Method
- Status Code and Delivery Status
- User information and API Key details
- Creation timestamps
- Job type and processing status

### 4. **Dashboard Overview Export** ✅
**Location**: Overview page (`/overview`)
**Formats**: CSV, JSON
**Features**:
- Complete dashboard metrics export
- System health status
- Key performance indicators
- Real-time data snapshot

**Exportable Data**:
- API call statistics (total, today, this week)
- Success rates and error counts
- Queue performance metrics
- System health indicators
- Timestamped data points

### 5. **Live Logs Export** ✅
**Location**: Live Logs page (`/live`)
**Formats**: CSV, JSON
**Features**:
- Real-time log stream export
- Filtered by log level and search terms
- Timestamped log entries
- System event tracking

**Exportable Data**:
- Log level, message, timestamp
- Source and metadata
- Error details and stack traces
- System event information

## 🔧 Export Features

### **Filter Integration**
- **All exports respect current filters** applied in the UI
- **Date range filtering** for time-based exports
- **Search term filtering** for text-based searches
- **Status filtering** for specific data states
- **User/API Key filtering** for access control

### **Export Formats**

#### **CSV Format**
- **Comma-separated values** for spreadsheet compatibility
- **Header row** with field names
- **UTF-8 encoding** for international characters
- **Proper escaping** of special characters
- **Timestamp formatting** in ISO format

#### **JSON Format**
- **Structured data** with nested objects
- **Complete metadata** preservation
- **Pretty-printed** for readability
- **Type preservation** for complex data types
- **Array format** for multiple records

#### **XLSX Format** (Backend)
- **Excel-compatible** spreadsheet format
- **Multiple sheets** for complex data
- **Formatted cells** with proper data types
- **Charts and graphs** support
- **Professional presentation**

### **Export Options**

#### **Field Selection**
- **Custom field selection** for targeted exports
- **Default field sets** for common use cases
- **Nested field support** for complex data
- **Calculated fields** for derived metrics

#### **Metadata Inclusion**
- **Export timestamp** and user information
- **Filter summary** showing applied filters
- **Data source** and version information
- **Export statistics** (record count, date range)

#### **File Naming**
- **Automatic filename generation** with timestamps
- **Descriptive names** based on data type
- **Date-based organization** for easy sorting
- **Custom filename support** for specific needs

## 🚀 Usage Examples

### **Exporting Audit Logs**
```typescript
// Export with filters
const filters = {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  statusCode: 200,
  action: 'API_CALL'
};

await AuditApiService.exportAuditLogs({
  format: 'csv',
  filters,
  fields: ['id', 'action', 'method', 'statusCode', 'createdAt']
});
```

### **Exporting Queue Data**
```typescript
// Export queue performance
await ExportApiService.exportQueueData({
  format: 'json',
  includeMetadata: true
});
```

### **Bulk Export All Data**
```typescript
// Export complete dashboard data
await ExportApiService.exportAllData({
  format: 'xlsx',
  includeMetadata: true
});
```

## 🔒 Security & Access Control

### **Permission-Based Exports**
- **Role-based access** to export features
- **Data filtering** based on user permissions
- **Sensitive data protection** in exports
- **Audit logging** of all export activities

### **Export Limits**
- **Rate limiting** to prevent abuse
- **File size limits** for large exports
- **Record count limits** for performance
- **Time-based restrictions** for sensitive data

### **Data Privacy**
- **PII filtering** for compliance
- **Data anonymization** options
- **Retention policies** for exported data
- **Secure file handling** and cleanup

## 📈 Analytics & Insights

### **Export Analytics**
- **Export frequency tracking** by user and data type
- **Popular export formats** and field combinations
- **Performance metrics** for export operations
- **Usage patterns** and optimization opportunities

### **Data Insights**
- **Trend analysis** across exported data
- **Performance monitoring** through queue exports
- **Error tracking** via audit log exports
- **System health** monitoring through overview exports

## 🛠️ Technical Implementation

### **Frontend Export Service**
- **Client-side CSV/JSON generation** for immediate downloads
- **Blob handling** for file downloads
- **Progress indicators** for large exports
- **Error handling** and user feedback

### **Backend Export API**
- **Server-side processing** for complex exports
- **Database optimization** for large datasets
- **Streaming exports** for memory efficiency
- **Format conversion** and validation

### **Export Pipeline**
1. **User initiates export** with filters and options
2. **Frontend validates** permissions and parameters
3. **Backend processes** data with applied filters
4. **Format conversion** based on selected format
5. **File generation** with metadata and headers
6. **Secure download** with proper MIME types

## 📋 Export Checklist

### ✅ **Implemented Features**
- [x] Audit logs export (CSV, JSON, XLSX)
- [x] Queue data export (CSV, JSON)
- [x] Cron jobs export (CSV, JSON)
- [x] Dashboard overview export (CSV, JSON)
- [x] Live logs export (CSV, JSON)
- [x] Filter integration across all exports
- [x] Custom field selection
- [x] Metadata inclusion
- [x] Automatic filename generation
- [x] Permission-based access control
- [x] Error handling and user feedback

### 🔄 **Future Enhancements**
- [ ] PDF export format for reports
- [ ] Scheduled exports with email delivery
- [ ] Export templates and presets
- [ ] Data visualization in exports
- [ ] Export history and management
- [ ] API-based export triggers
- [ ] Real-time export streaming
- [ ] Export data validation and verification

## 🎯 **Key Benefits**

1. **Complete Data Access** - Export any data visible in the dashboard
2. **Filter Integration** - All exports respect current UI filters
3. **Multiple Formats** - CSV, JSON, and XLSX support
4. **Role-Based Security** - Exports respect user permissions
5. **Real-Time Data** - Export current dashboard state
6. **Compliance Ready** - Audit trails and data retention
7. **Analytics Ready** - Structured data for analysis tools
8. **User Friendly** - One-click export with automatic downloads

---

**Note**: All export features are fully integrated with the authentication and permission system, ensuring that users can only export data they have access to view. Export activities are logged for audit purposes.
