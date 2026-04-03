'use client'
import GrayBtn from '@/components/button/gray-btn';
import SeacrhForm from '@/components/input/search-form';
import { MaterialdataContext } from '@/lib/context/material-data';
import { ToastContext } from '@/lib/context/toast';
import { ColorContext } from '@/lib/context/topbar-color';
import { timestampToDateTime } from '@/lib/utils/timestampToDateTime';
import { timestampToTime } from '@/lib/utils/timestampToTime';
import { faArrowLeft, faArrowRight, faArrowRightLong, faCaretRight, faChevronRight, faCodeMerge, faMagnifyingGlass, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'

export default function page() {
    const { materialData, isLoadMaterialData } = useContext(MaterialdataContext);
    const [data, setData] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const { setTopbarColor, topColors } = useContext(ColorContext);
    const [valueToSrc, setValueToSrc] = useState("");
    const [valueToSrcMaterial, setValueToSrcMaterial] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isScrollingUp, setIsScrollingUp] = useState(false);
    const { closeToast } = useContext(ToastContext);

    useEffect(() => closeToast(), []);

    useEffect(() => {
        setData(materialData.data);
    }, [materialData]);

    return (
        <div className="flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-white from-1% to-transparent">
            <div className="top-0 p-4 py-2 lg:p-6 sticky flex flex-col gap-4 z-2 bg-gradient-to-b from-white from-90% via-50% to-transparent">
                <Topbar
                    params={{
                        materialData,
                        isLoadMaterialData,
                        valueToSrcMaterial,
                        setValueToSrcMaterial,
                        isScrollingUp,
                    }}
                />
            </div>
            <div className="px-4 lg:px-6 pb-8 bg-white min-h-[calc(100vh-5rem)]">
                <Content
                    itemsPerPage={15}
                    params={{
                        searchTerm: valueToSrcMaterial,
                        data,
                        setSearchOpen,
                        setValueToSrc,
                        currentPage,
                        setCurrentPage,
                        setIsScrollingUp,
                    }}
                />
            </div>

        </div>
    )
}

function Topbar({ params }) {
    const router = useRouter();
    const [searchFormOpen, setSearchFormOpen] = useState(false);
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
                <p className=" text-lg font-semibold">Listing SO </p>

                {searchFormOpen && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="absolute w-full pl-1 lg:pl-0"
                        >
                            <SeacrhForm
                                isOpen={searchFormOpen}
                                setIsOpen={setSearchFormOpen}
                                valueToSrc={params.valueToSrcMaterial}
                                setValueToSrc={params.setValueToSrcMaterial}
                            />
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
            <button
                className={`${searchFormOpen
                    ? "bg-gray-100 order-last border-1 border-gray-50"
                    : "bg-indigo-50 order-last border-1 border-indigo-50"
                    } group a-middle px-4 py-2.5 h-full font-medium rounded-2xl cursor-pointer`}
                onClick={() => {
                    setSearchFormOpen(!searchFormOpen);
                    params.setValueToSrcMaterial("");
                }}
            >
                <p>
                    {searchFormOpen ? (
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-500" />
                    ) : (
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="text-indigo-400"
                        />
                    )}
                </p>
            </button>
        </div>
    );
}

function Content({ params, itemsPerPage = 25 }) {
    if (!params.data || params.data.length === 0) return null;
    const filteredData = params.data.filter((item) => {
        const matchesSearch =
            params.searchTerm === "" ||
            Object.entries(item).some(([key, value]) =>
                String(value).toLowerCase().includes(params.searchTerm.toLowerCase())
            );
        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (params.currentPage - 1) * itemsPerPage,
        params.currentPage * itemsPerPage
    );

    return (
        <>
            <div className="flex flex-col pb-4 min-h-[calc(100vh-11rem)]">
                {filteredData?.length === 0 && (
                    <p className="text-gray-500 text-sm p-24 text-center">
                        No data found
                    </p>
                )}
                {filteredData?.length != 0 &&
                    paginatedData.map((value, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                params.setValueToSrc(value.mid);
                                params.setSearchOpen(true);
                            }}
                            className={`group relative grid grid-cols-1 lg:grid-cols-2 items-start lg:items-center gap-2 border-t border-gray-200 bg-white p-4 px-2 cursor-pointer hover:bg-gray-50 `}
                        >
                            <div className="flex gap-3 justify-start items-center w-full">
                                <div className="flex flex-col gap-1 justify-start items-center min-w-[80px]">
                                    <div className="flex gap-1 w-full">
                                        <p className='text-sm flex-1 bg-indigo-50 text-indigo-500 rounded-xl p-1.5 text-center'>T1</p>
                                        <p className='text-sm flex-1 rounded-xl p-1.5 text-center bg-gray-100'>25</p>
                                    </div>
                                    <p className='w-full font-light text-sm rounded-xl p-1 px-2 text-center bg-gray-100 text-gray-700'>Page 1</p>
                                </div>
                                <FontAwesomeIcon icon={faCaretRight} className='text-gray-300 text-sm px-1' />
                                <div className="flex flex-col justify-center items-start">
                                    <p className=''>{value?.mid}</p>
                                    <p className='font-light'>{value?.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            <Pagination
                setCurrentPage={params.setCurrentPage}
                currentPage={params.currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                filteredData={filteredData}
                setIsScrollingUp={params.setIsScrollingUp}
            />
        </>
    );
}

function Pagination({
    setCurrentPage,
    currentPage,
    totalPages,
    itemsPerPage,
    filteredData,
    setIsScrollingUp,
}) {
    const scrollToTop = () => {
        setIsScrollingUp(true);
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    return (
        <div className="px-4 lg:px-4 pt-2 flex justify-between items-center ">
            <div className="text-sm text-gray-500 line-clamp-1">
                <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredData?.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData?.length}</span>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        scrollToTop();
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        scrollToTop();
                    }}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-4 py-2 text-sm font-medium text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}