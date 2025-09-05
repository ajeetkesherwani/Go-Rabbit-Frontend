import { Button, Space, Table, Tag } from 'antd';
import { FaTrash } from 'react-icons/fa';
import { IoMdEye } from 'react-icons/io';
import { useNavigate } from 'react-router';
import { getAllOrder } from '../../../../services/admin/apiOrder';
import { useEffect, useState } from 'react';
import { convertDate } from '../../../../utils/formatDate';
import RefundModal from './RefundModal';

const OrderTable = ({ searchText, type, service, onCountsUpdate }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false);
    const [refundModalVisible, setRefundModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    console.log(service)

    useEffect(() => { fetchOrderList(type) }, [type, service]);

    const fetchOrderList = async (type) => {
        setLoading(true)
        try {
            const res = await getAllOrder(service, type)
            setOrders(res.orders || [])

            // Update counts if available in response
            if (res.counts && onCountsUpdate) {
                onCountsUpdate(res.counts);
            }

            // console.log(res.orders)
        } catch (error) {
            console.log(error)
            // message.error("something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = (record) => {
        navigate(`/admin/order/${service}/${record._id}`);
    };

    const handleRefund = (record) => {
        setSelectedOrder(record);
        setRefundModalVisible(true);
    };

    const handleRefundSuccess = () => {
        // Refresh the order list after successful refund
        fetchOrderList(type);
    };

    const handleRefundCancel = () => {
        setRefundModalVisible(false);
        setSelectedOrder(null);
    };

    const columns = [
        {
            title: 'Booking ID',
            dataIndex: 'booking_id',
            key: 'booking_id',
            align: 'center',
        },
        {
            title: 'Delivery Date',
            dataIndex: 'deliveryDate',
            key: 'deliveryDate',
            align: 'center',
            render: (deliveryDate) => `${convertDate(deliveryDate)}`,
        },
        {
            title: 'Delivery Time',
            dataIndex: 'deliveryTime',
            key: 'deliveryTime',
            align: 'center',
        },
        {
            title: 'Total Amount',
            dataIndex: 'finalTotalPrice',
            key: 'finalTotalPrice',
            align: 'center',
            render: (amount) => `₹${amount}`,
        },
        {
            title: 'Order Status',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            align: 'center',
            render: (status) => (
                <Tag
                    color={
                        status === 'delivered'
                            ? 'green'
                            : status === 'accepted'
                                ? 'blue'
                                : 'orange'
                    }
                >
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            align: 'center',
            render: (status) => (
                <Tag
                    color={
                        status == 'paid'
                            ? 'green'
                            : status == 'pending'
                                ? 'orange'
                                : 'red'
                    }
                >
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Payment Mode',
            dataIndex: 'paymentMode',
            key: 'paymentMode',
            align: 'center',
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedDriver',
            key: 'assignedDriver',
            align: 'center',
            render: (assignedDriver) =>
                assignedDriver ? (
                    <Tag color="green">{assignedDriver}</Tag>
                ) : (
                    <Tag color="red">Not Assigned</Tag>
                ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<IoMdEye />}
                        onClick={() => handleViewDetails(record)}
                    />
                    {type === 'cancelled' && (
                        record.isRefunded ? (
                            <Tag color='green'>Refunded Done</Tag>
                        ) : (
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
                                onClick={() => handleRefund(record)}
                            >
                                Refund
                            </Button>
                        )
                    )}
                </Space >
            ),
        },
    ];

    return (
        <>
            <Table
                dataSource={orders.filter((item) =>
                    item.booking_id.toLowerCase().includes(searchText.toLowerCase())
                )}
                columns={columns}
                rowKey="_id"
                scroll={{ x: true }}
                bordered
                size="small"
                loading={loading}
            />

            <RefundModal
                visible={refundModalVisible}
                onCancel={handleRefundCancel}
                orderData={selectedOrder}
                onSuccess={handleRefundSuccess}
            />
        </>
    );
};

export default OrderTable;
