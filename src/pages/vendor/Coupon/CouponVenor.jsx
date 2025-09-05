import React, { useEffect, useState } from 'react';
import { Button, Input, message, Modal } from 'antd';
import { FaPlus } from 'react-icons/fa';
import CategoryTable from './components/CouponTable';
import AddCouponModel from './components/AddCouponModel';
import EditCouponModel from './components/EditCouponModel';
import { getAllCoupon, deleteCoupon } from '../../../services/vendor/apiCoupon';
import { getAllShop } from '../../../services/vendor/apiShop';

function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await getAllCoupon();
            setCoupons(data);
        } catch {
            message.error("Failed to load coupons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
        fetchAllShop()
    }, []);

    const fetchAllShop = async () => {
        setLoading(true)
        try {
            const res = await getAllShop()

            setShops(res)
        } catch (error) {
            // console.log(error)
            message.error("Something went wrong!")
        } finally {
            setLoading(false)
        }
    }

    const openModal = (coupon = null) => {
        setSelectedCoupon(coupon);
        setEditMode(!!coupon);
        setIsModalOpen(true);
    };

    const closeModal = (refresh = false) => {
        setIsModalOpen(false);
        setSelectedCoupon(null);
        if (refresh) fetchCoupons();
    };

    const handleDelete = (coupon) => {
        Modal.confirm({
            title: 'Delete Coupon',
            content: `Are you sure you want to delete "${coupon.code}"?`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No, Cancel',
            onOk: async () => {
                try {
                    await deleteCoupon(coupon._id); // ✅ assume this function exists
                    message.success("Coupon deleted successfully!");
                    fetchCoupons();
                } catch {
                    message.error("Failed to delete coupon.");
                }
            }
        });
    };

    return (
        <>
            <div className='lg:px-10 px-5 my-8 md:flex items-center gap-4 justify-between'>
                <Input.Search
                    placeholder="Search by code"
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 300, borderRadius: '6px' }}
                    size="large"
                />
                <Button
                    type="primary"
                    icon={<FaPlus />}
                    size="large"
                    onClick={() => openModal()}
                >
                    Add Coupon
                </Button>
            </div>

            <CategoryTable
                loading={loading}
                searchText={searchText}
                data={coupons}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            {editMode ? (
                <EditCouponModel
                    isModalOpen={isModalOpen}
                    handleOk={() => closeModal(true)}
                    handleCancel={() => closeModal(false)}
                    couponData={selectedCoupon}
                    shops={shops}
                />
            ) : (
                <AddCouponModel
                    isModalOpen={isModalOpen}
                    handleOk={() => closeModal(true)}
                    handleCancel={() => closeModal(false)}
                    shops={shops}
                />
            )}
        </>
    );
}

export default CouponManagement;
