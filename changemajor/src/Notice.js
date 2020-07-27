import React, { Component } from "react";
import "./css/App.css";

import Container from "react-bootstrap/Container";
import Menu from "./components/Menu";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Select from "react-select";
import StaticData from "./StaticData";
import serviceauth from "./auth/serviceauth";
import Masquerade from "./components/Masquerade";

class Notice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      asurite: "",
      // admin: ["guirongg", "cwade", "tebernar", "ejulian"],
      admin: StaticData.adminList,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitMasquerade = this.handleSubmitMasquerade.bind(this);
  }

  handleChange(event) {
    var name = event.target.name;
    var value = event.target.value;
    // alert("name=" + name + ",value=" + value);
    this.setState({ [name]: value });
  }

  handleSubmitMasquerade = (event) => {
    event.preventDefault();
    // this.getStudentMajor();
    console.log("set viewas=" + this.state.asurite);
    sessionStorage.setItem(serviceauth.SS_VIEW_AS, this.state.asurite);
    window.location.href = "/";
  };

  render() {
    return (
      <Container fluid={true} className="p-0">
        <Header />

        <Menu />
        <Container className="changeMajorForm">
          <div className="pageTitle">
            We are unable to process your request using this form.
          </div>
        </Container>

        <Container className="changeMajorForm">
          <br />
          <p>
            Please be advised that only degree-seeking, undergraduate students
            can use this form. You may not be eligible to change your major
            using this form. If you are a graduate student or new to ASU, please
            go{" "}
            <a href="https://students.asu.edu/changingmajors" target="_blank">
              here
            </a>{" "}
            for information on changing your major.
          </p>

          <p>
            To check eligibility requirements for this form, or if you believe
            you should have access to it, please contact your academic advisor.
          </p>
          <br />
          <br />
          <br />
        </Container>

        {this.state.admin.includes(
          sessionStorage.getItem(serviceauth.SS_ASURITE)
        ) ? (
          <Container>
            <div className="error_message">
              <Masquerade
                handleSubmitMasquerade={this.handleSubmitMasquerade.bind(this)}
                handleChange={this.handleChange.bind(this)}
              />
            </div>
          </Container>
        ) : null}

        <Footer />
      </Container>
    );
  }
}

export default Notice;
