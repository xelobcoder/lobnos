import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Loader from "../../../../../components/accessories/Loader";
import CreateTestFields from "../../../../../components/settingsComponents/FieldsCreation/createfieldsComponent";
import { Row, Col, Form, ListGroup, Button } from "react-bootstrap";

export default function MultipleTestFieldCreator() {
  const [testlist, setTestList] = useState([]);
  const [temp, setTemp] = useState([]);
  const [testname, setTestname] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    customFetch("testpanel/list/bulk")
      .then((response) => {
        const { data } = response;
        if (Array.isArray(data)) {
          setTestList(data);
          setTemp(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setTestList([]);
        alert("Something went wrong");
        setLoading(false);
      });
  }, []);

  const filtertest = (ev) => {
    const input = ev.target.value.toLowerCase();
    setTestname(input);
    if (input.length > 1) {
      const filtered = temp.filter((item) => item.name.toLowerCase().startsWith(input));
      setTestList(filtered.length > 0 ? filtered : [...temp]);
    } else {
      setTestList([...temp]);
    }
  };

  const testListrenderingView = () => {
    if (loading) return <Loader />;
    if (testlist.length === 0) return <h5>No tests available</h5>;
    return (
      <ListGroup className="mt-2 pointer">
        {testlist.map((item, index) => (
          <ListGroup.Item
            className={`list-group-item ${active === item.id ? "bg-primary text-white" : ""}`}
            onClick={() => setActive(item.id)}
            key={index}>
            {item.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <MainSettingsLayoutView>
      <Row className="mx-0 text-sm">
        <Col md={3} className="border-right py-3" style={{ height: "100vh", overflowY: "auto" }}>
          <h5>Test List</h5>
          <Form.Control type="text" placeholder="Filter tests" onChange={filtertest} value={testname} className="mb-3" />
          {testListrenderingView()}
        </Col>

        <Col md={9} className="py-3 text-sm">
          <h5>Create Test Fields</h5>
          {active ? <CreateTestFields testid={active} minimize={false} /> : <p>Please select a test from the list.</p>}
        </Col>
      </Row>
    </MainSettingsLayoutView>
  );
}
