"use client";

import { useState, useMemo } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import HeroSection from "../components/admin/HeroSection";
import FileUploadZone from "../components/admin/FileUploadZone";
import FeatureCards from "../components/admin/FeatureCards";
import ErrorMessage from "../components/admin/ErrorMessage";
import DataPreview from "../components/admin/DataPreview";
import JSONOutput from "../components/admin/JSONOutput";
import { useExcelParser } from "../components/admin/useExcelParser";
import { useDatabaseUpload } from "../components/admin/useDatabaseUpload";
import { ROWS_PER_PAGE } from "../components/admin/types";

export default function AdminPage() {
  // Custom Hooks
  const {
    excelData,
    error,
    isProcessing,
    handleDrop: onDrop,
    handleFileChange: onFileChange,
  } = useExcelParser();

  const { uploading, uploadMessage, uploadToDatabase } = useDatabaseUpload();

  // State Management
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  // JSON Operations
  const jsonString = useMemo(
    () => JSON.stringify(excelData, null, 2),
    [excelData]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Database Upload
  const handleUploadToDatabase = async () => {
    await uploadToDatabase(excelData, collectionName);
  };

  // Pagination
  const columns = useMemo(() => {
    if (excelData.length === 0) return [];
    return Object.keys(excelData[0]);
  }, [excelData]);

  const totalPages = Math.ceil(excelData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedData = excelData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // File handlers with drag state
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDrop(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <AdminNavbar />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <HeroSection />

          <FileUploadZone
            isDragging={isDragging}
            isProcessing={isProcessing}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileChange={onFileChange}
          />

          {excelData.length === 0 && !error && <FeatureCards />}

          {error && <ErrorMessage error={error} />}

          {excelData.length > 0 && (
            <div className="space-y-8">
              <DataPreview
                excelData={excelData}
                columns={columns}
                paginatedData={paginatedData}
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />

              <JSONOutput
                excelData={excelData}
                jsonString={jsonString}
                copied={copied}
                uploading={uploading}
                collectionName={collectionName}
                uploadMessage={uploadMessage}
                onCopy={handleCopy}
                onCollectionNameChange={setCollectionName}
                onUploadToDatabase={handleUploadToDatabase}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
