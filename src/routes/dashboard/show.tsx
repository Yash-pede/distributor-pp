import { useGetIdentity } from '@refinedev/core'
import React from 'react'

const DashboardHome = () => {
  const {data} = useGetIdentity()
  return (
    <div>DashboardHome</div>
  )
}

export default DashboardHome