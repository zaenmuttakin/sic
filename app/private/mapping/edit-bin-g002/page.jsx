"use client";

import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import GrayBtn from "../../../../components/button/gray-btn";
import React, { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { getBinSpBase } from "@/app/api/bin/action";

export default function page() {
    const [columnDefs, setColumnDefs] = useState([
        { field: "bin", headerName: "Bin", filter: true, editable: true },
        { field: "mid", headerName: "Material ID", filter: true, editable: true, },
        { field: "desc", headerName: "Description", filter: true, editable: true, },
        { field: "uom", headerName: "UOM", filter: true, editable: true, },
        { field: "pic", headerName: "PIC", filter: true, editable: true, },
        { field: "valid_at", headerName: "Valid At", filter: true, editable: true, },
    ]);

    return (
        <div className="flex flex-col max-w-7xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
            <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
                <Topbar />
            </div>
            <div className="px-4 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)]">
                <Content columnDefs={columnDefs} />
            </div>
        </div>
    );
}

function Topbar() {
    const router = useRouter();
    return (
        <div
            className={`topbar flex items-center justify-between px-0 py-2 gap-2 `}
        >
            <div className="flex-1 flex justify-start items-center relative w-full gap-1">
                <GrayBtn
                    label={<FontAwesomeIcon icon={faArrowLeft} />}
                    onClick={() => router.back()}
                    style="bg-transparent"
                />
                <p className=" text-lg font-semibold">
                    Bin G002
                </p>
            </div>
        </div>
    );
}

function Content({ columnDefs }) {
    const [gridApi, setGridApi] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRows, setTotalRows] = useState(0); // Added to track total rows for display

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 150,
        filter: true,
    }), []);

    const onGridReady = (params) => {
        setGridApi(params.api);
        const dataSource = {
            rowCount: undefined,
            getRows: async (params) => {
                const { startRow, endRow } = params;
                const limit = endRow - startRow;
                const page = Math.floor(startRow / limit);

                try {
                    const { data, totalCount } = await getBinSpBase("g002", "", page, limit);
                    params.successCallback(data, totalCount);
                    setTotalRows(totalCount); // Update total rows
                } catch (error) {
                    console.error("Error fetching bin data:", error);
                    params.failCallback();
                }
            }
        };
        params.api.setGridOption('datasource', dataSource);
    };

    const onPaginationChanged = (params) => {
        if (params.api) {
            setCurrentPage(params.api.paginationGetCurrentPage() + 1);
            setTotalPages(params.api.paginationGetTotalPages());
        }
    };

    return (
        <>
            <div className="ag-theme-quartz" style={{ height: "calc(100vh - 12rem)" }}>
                <AgGridReact
                    theme="legacy"
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowModelType="infinite"
                    cacheBlockSize={50}
                    pagination={true}
                    paginationPageSize={50}
                    suppressPaginationPanel={true}
                    onGridReady={onGridReady}
                    onPaginationChanged={onPaginationChanged}
                />
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => gridApi && gridApi.paginationGoToPage(page - 1)}
                totalRows={totalRows}
            />
        </>
    );
}

function Pagination({ currentPage, totalPages, onPageChange, totalRows }) {
    return (
        <div className="px-4 py-4 flex gap-4 lg:flex-row justify-between items-center bg-white border-t border-gray-100">
            <div className="text-sm text-gray-500 font-medium w-full">
                Page {currentPage} of {totalPages} <span className="opacity-50">({totalRows} items)</span>
            </div>
            <div className="flex flex-1 items-center gap-2 w-full">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex-none px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="lg:block hidden">Previous</span>
                    <span className="lg:hidden block"><FontAwesomeIcon icon={faArrowLeft} /></span>
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex-none px-4 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
                >
                    <span className="lg:block hidden">Next</span>
                    <span className="lg:hidden block"><FontAwesomeIcon icon={faArrowRight} /></span>
                </button>
            </div>
        </div>
    );
}
