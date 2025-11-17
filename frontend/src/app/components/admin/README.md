# Admin Components

This directory contains all the components, hooks, and utilities for the Excel to JSON Admin page.

## Structure

```
admin/
├── components/           # UI Components
│   ├── AdminNavbar.tsx          # Fixed navbar with branding
│   ├── HeroSection.tsx          # Page title and description
│   ├── FileUploadZone.tsx       # Drag-and-drop file upload
│   ├── FeatureCards.tsx         # Feature highlights (3 cards)
│   ├── ErrorMessage.tsx         # Error display component
│   ├── DataPreview.tsx          # Excel data table preview
│   └── JSONOutput.tsx           # JSON display and MongoDB upload
│
├── hooks/                # Custom Hooks
│   ├── useExcelParser.ts        # Excel file parsing logic
│   └── useDatabaseUpload.ts     # MongoDB upload functionality
│
├── types.ts              # TypeScript types and constants
└── index.ts              # Barrel exports
```

## Components

### AdminNavbar

Fixed navigation bar at the top of the page with:

- Excel to JSON branding
- Toyota Hackathon badge

### HeroSection

Centered hero section with page title and subtitle.

### FileUploadZone

Drag-and-drop file upload zone with:

- Visual drag feedback
- Loading state
- File type validation
- Supports: `.xlsx`, `.xls`, `.csv`

### FeatureCards

Three feature cards displayed when no data is loaded:

- Lightning Fast
- Multi-Sheet Support
- Easy Export

### ErrorMessage

Error display component for showing file upload or parsing errors.

### DataPreview

Paginated table view of the Excel data with:

- Type-specific cell rendering (numbers, booleans, null values)
- Pagination controls
- Record count display

### JSONOutput

JSON display and MongoDB upload section with:

- Formatted JSON code display
- Copy to clipboard functionality
- Collection name input
- Upload to database button
- Upload status messages

## Hooks

### useExcelParser

Manages Excel file parsing and validation:

```tsx
const { excelData, error, isProcessing, handleDrop, handleFileChange } =
  useExcelParser();
```

**Returns:**

- `excelData` - Parsed Excel data as array of objects
- `error` - Error message (if any)
- `isProcessing` - Loading state during file parsing
- `handleDrop` - Drop event handler
- `handleFileChange` - File input change handler

### useDatabaseUpload

Manages MongoDB upload functionality:

```tsx
const { uploading, uploadMessage, uploadToDatabase } = useDatabaseUpload();
```

**Returns:**

- `uploading` - Loading state during upload
- `uploadMessage` - Success/error message after upload
- `uploadToDatabase(data, collectionName)` - Function to upload data

## Types

### ExcelDataRow

```typescript
type ExcelDataRow = Record<string, string | number | boolean | null>;
```

### UploadMessage

```typescript
interface UploadMessage {
  type: "success" | "error";
  text: string;
}
```

## Constants

- `MAX_FILE_SIZE` - Maximum file size (5 MB)
- `ROWS_PER_PAGE` - Rows per page in preview (10)

## Usage Example

```tsx
import {
  AdminNavbar,
  HeroSection,
  FileUploadZone,
  FeatureCards,
  ErrorMessage,
  DataPreview,
  JSONOutput,
  useExcelParser,
  useDatabaseUpload,
  ROWS_PER_PAGE,
} from "../components/admin";

export default function AdminPage() {
  const { excelData, error, isProcessing, handleDrop, handleFileChange } =
    useExcelParser();
  const { uploading, uploadMessage, uploadToDatabase } = useDatabaseUpload();

  // ... rest of your component logic
}
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused or extended
3. **Maintainability**: Easier to find and update specific functionality
4. **Testability**: Individual components and hooks can be tested in isolation
5. **Type Safety**: Shared types prevent inconsistencies
6. **Clean Imports**: Barrel exports make imports cleaner and more organized
