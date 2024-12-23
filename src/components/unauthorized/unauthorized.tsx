
import { Button, Result } from 'antd'
import React from 'react'
import Paragraph from 'antd/lib/typography/Paragraph'
import { Text } from '../text'
import { CloseCircleOutlined } from '@ant-design/icons'
import { useLogout } from '@refinedev/core'

export const Unauthorized = () => {
  const { mutate: logout } = useLogout();

  return (
    <Result
    status="error"
    title="Unauthorized Access for Distributor"
    subTitle="Please contact administrator"
    extra={[
      <Button type="primary" onClick={() => logout()}>
        Log Out
      </Button>,
    ]}
  >
    <div className="desc">
      <Paragraph>
        <Text
          strong
          style={{
            fontSize: 16,
          }}
        >
          Here are some reasons why you are seeing this error:
        </Text>
      </Paragraph>
      <Paragraph>
        <CloseCircleOutlined className="site-result-demo-error-icon" /> Your account has been
        frozen. <a>You are banned to access &gt;</a>
      </Paragraph>
      <Paragraph>
        <CloseCircleOutlined className="site-result-demo-error-icon" /> Your account is not yet
        eligible to apply. <a>Please contact administrator &gt;</a>
      </Paragraph>
    </div>
  </Result>
  )
}
