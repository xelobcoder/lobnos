import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useRouter } from "next/router";

export default function ThreeColumnPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  const links = [
    { name: "Link 1", href: "/page1" },
    { name: "Link 2", href: "/page2" },
    { name: "Link 3", href: "/page3" },
    { name: "Link 4", href: "/page4" },
    { name: "Link 5", href: "/page5" },
    { name: "Link 6", href: "/page6" },
    { name: "Link 7", href: "/page7" },
    { name: "Link 8", href: "/page8" },
    { name: "Link 9", href: "/page9" },
    { name: "Link 10", href: "/page10" },
  ];

  return (
    <Row className="mx-0">
      <Col md={2} className="border-right py-3"></Col>

      <Col md={8} className="py-3"></Col>

      <Col md={2} className="border-left py-3"></Col>
    </Row>
  );
}
