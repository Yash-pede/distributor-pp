import { useGetIdentity } from '@refinedev/core'
import React from 'react'

const DashboardHome = () => {
  const {data} = useGetIdentity()
  return (
    <div>{data?.banned_until}</div>
  )
}

export default DashboardHome