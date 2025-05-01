import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";

const RatingsPage = () => {
  const reviews = [
    {
      id: 1,
      service: "Plumbing",
      rating: 4.5,
      review: "Great service! The plumber arrived on time and fixed the issue quickly.",
    },
    {
      id: 2,
      service: "Electrical Work",
      rating: 5,
      review: "Excellent work! Highly recommend their electrical services.",
    },
    {
      id: 3,
      service: "Carpentry",
      rating: 3,
      review: "The carpenter did an amazing job on my custom furniture.",
    },
  ];

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Ratings & Reviews</h2>
      <Row>
        {reviews.map((review) => (
          <Col key={review.id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{review.service}</Card.Title>
                <Card.Text>
                  <strong>Rating:</strong> {review.rating}/5
                </Card.Text>
                <Card.Text>{review.review}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default RatingsPage;