import { Show } from '@refinedev/antd'
import React from 'react'
import { useLocation } from 'react-router-dom';

export const OrdersShow = () => {
    const orderId = useLocation().pathname.split("/").pop();

  return (
    <Show canDelete={false} canEdit={false} > 
        
    </Show>
  )
}
