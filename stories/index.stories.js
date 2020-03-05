import './runtimeConfig'
import React from 'react'
import { View } from 'react-native'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import Stripe, { SuccessMessage, StatusMessage } from '../src/Stripe/Stripe'

import './baseStyles.css'


storiesOf('Stripe')
    .add('basic', () => (
        <Stripe
            editor
            appId="2be7b3d2-9e96-4827-a17c-593eac566671"
            amount="10000"
            paybuttonbutton={{
              paybuttonlabel:"PAY",
              backgroundColor: '#f00',
              color: '#fff',
              onSuccess: action('Submitted Payment Successfully'),
            }}
            chargedescription={{charge_description:"Your favorite widget source."}}
            iconName="filter-drama"
            userinfoemail={{user_info_email:"nick@fodor.net"}}
        />
    ))

storiesOf('SuccessMessage')
    .add('basic', () => (
        <SuccessMessage cardNumber='4242424242424242' amount={12.34} />
    ))

storiesOf('StatusMessage')
    .add('basic', () => (
        <StatusMessage message="Hello world." />
    ))
