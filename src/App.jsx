import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const API_URL = "https://24fea8fd-8897-4edb-803b-7d7559c87084-00-p9u0ugs7fhkg.sisko.replit.dev";
const PASTRIES = [
  "Croissants", "Chocolate Eclairs", "Apple Tarts", "Cinnamon Rolls",
  "Macarons", "Blueberry Muffins", "Cheese Danishes", "Strawberry Shortcakes",
  "Lemon Bars", "Pecan Pies"
];

const App = () => {
  const [bookings, setBookings] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_URL}/bookings`);
        setBookings(response.data);
        localStorage.setItem("bookings", JSON.stringify(response.data));
      } catch (error) {
        const localData = localStorage.getItem("bookings");
        if (localData) setBookings(JSON.parse(localData));
      }
    };
    fetchBookings();
  }, []);

  const handleShowModal = (booking = null) => {
    setCurrentBooking(booking);
    setModalShow(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { customer_name, pastry_name, expected_date, remarks, amount } = e.target.elements;
    const newBooking = {
      customer_name: customer_name.value,
      pastry_name: pastry_name.value,
      expected_date: expected_date.value,
      remarks: remarks.value,
      amount: parseInt(amount.value),
    };

    try {
      if (currentBooking) {
        await axios.put(`${API_URL}/bookings/${currentBooking.id}`, newBooking);
      } else {
        await axios.post(`${API_URL}/bookings`, newBooking);
      }
      window.location.reload();
    } catch (error) {
      alert("Failed to save booking");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/bookings/${currentBooking.id}`);
      setDeleteModalShow(false);
      window.location.reload();
    } catch (error) {
      alert("Failed to delete booking");
    }
  };

  const handleCompleteBooking = async (booking) => {
    try {
      const updatedBooking = { ...booking, completed: !booking.completed };
      await axios.put(`${API_URL}/bookings/${booking.id}/complete`, updatedBooking);
      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === booking.id ? updatedBooking : b))
      );
    } catch (error) {
      alert("Failed to update booking status");
    }
  };

  const handleDeleteModal = (booking) => {
    setCurrentBooking(booking);
    setDeleteModalShow(true);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center text-uppercase" style={{ color: 'var(--midnight-green)' }}>Pastry Booking System</h1>
      <Button onClick={() => handleShowModal()} className="mb-3" variant="primary" size="lg">Add Booking</Button>
      <Table striped bordered hover variant="light" style={{ borderRadius: '10px' }}>
        <thead>
          <tr className="table-dark">
            <th>Customer</th>
            <th>Pastry</th>
            <th>Expected Date</th>
            <th>Remarks</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className='table-info'>
              <td>{booking.customer_name}</td>
              <td>{booking.pastry_name}</td>
              <td>{new Date(booking.expected_date).toLocaleDateString()}</td>
              <td>{booking.remarks}</td>
              <td>{booking.amount}</td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={booking.completed}
                  onChange={() => handleCompleteBooking(booking)}
                  label="Completed"
                />
                <Button
                  variant="warning"
                  onClick={() => handleShowModal(booking)}
                  style={{ borderRadius: '50%', marginRight: '8px' }}
                  title="Edit booking"
                  disabled={booking.completed}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteModal(booking)}
                  style={{ borderRadius: '50%' }}
                  title="Delete booking"
                  disabled={booking.completed}
                >
                  <FaTrashAlt />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header className="bg-dark text-white" closeButton>
          <Modal.Title>{currentBooking ? "Edit Booking" : "Add Booking"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form onSubmit={handleSave}>
            <Form.Group>
              <Form.Label>Customer Name</Form.Label>
              <Form.Control type="text" name="customer_name" defaultValue={currentBooking?.customer_name || ""} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pastry</Form.Label>
              <Form.Select name="pastry_name" defaultValue={currentBooking?.pastry_name || ""} required>
                {PASTRIES.map((pastry) => (
                  <option key={pastry} value={pastry}>{pastry}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Expected Date</Form.Label>
              <Form.Control type="date" name="expected_date" defaultValue={currentBooking?.expected_date?.split('T')[0] || ""} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control as="textarea" name="remarks" defaultValue={currentBooking?.remarks || ""} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" name="amount" defaultValue={currentBooking?.amount || ""} required />
            </Form.Group>
            <Button type="submit" variant="success" className="mt-3">Save</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)} >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <p style={{ color: 'red' }}>Are you sure you want to delete this booking?</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white">
          <Button variant="secondary" onClick={() => setDeleteModalShow(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
