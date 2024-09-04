import { useGetIdentity } from "@refinedev/core";
import { Col, Row } from "antd";
import React from "react";
import IncomingFundsCurrentMonth from "./components/Incoming-funds-curr-mo";
import { IncomingFundsPastMonth } from "./components/Incoming-funds-past-mo";
import { ChallanCurrentMonth } from "./components/challan-curr-mo";
import ChallanDetails from "./components/challan-details";
import ProductsChart from "./components/products-proportion";
import TopPerformers from "./components/top-performers";

const DashboardHome = () => {
  const { data: user } = useGetIdentity<any>();
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={24} xl={8}>
          <IncomingFundsCurrentMonth userId={user?.id} />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <IncomingFundsPastMonth userId={user?.id} />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <ChallanCurrentMonth userId={user?.id} />
        </Col>
      </Row>

      <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col
          xs={24}
          sm={24}
          xl={8}
          style={{
            height: "432px",
          }}
        >
          <ProductsChart />
        </Col>
        <Col
          xs={24}
          sm={24}
          xl={16}
          style={{
            height: "432px",
          }}
        >
          <ChallanDetails userId={user?.id} />
        </Col>
      </Row>

      {/* <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col xs={24} sm={24} xl={14} xxl={16}>
          <TopPerformers />
        </Col>
        <Col xs={24} sm={24} xl={10} xxl={8}>
          CalendarUpcomingEvents
        </Col>
      </Row> */}

      {/* <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col
          xs={24}
          sm={24}
          xl={8}
          style={{
            height: "448px",
          }}
        >
          DashboardTasksChart
        </Col>
        <Col
          xs={24}
          sm={24}
          xl={16}
          style={{
            height: "448px",
          }}
        >
          CompaniesMap
        </Col>
      </Row> */}
    </div>
  );
};

export default DashboardHome;
