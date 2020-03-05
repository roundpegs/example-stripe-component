import React, { Component } from 'react'

import {
  ActivityIndicator,
  Platform,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native'

import color from 'color'
import axios from 'axios'
import Icon from 'react-native-vector-icons/dist/MaterialIcons'
import qs from 'qs'
import { paymentURL, verifyURL, customerURL } from '../config'

const UNKNOWN_ERROR =
  'An unknown error occurred. Please make sure your card number is correct and try again.'

const PLACEHOLDER_COLOR = '#8e8e8e'

const styles = StyleSheet.create({
  input: {
    ...Platform.select({
      web: { outline: 'none' },
    }),
    padding: 0,
  },
  savedCard: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  savedCardDetails: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeCardButton: {
    alignItems: 'baseline',
    letterSpacing: 0.8,
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
    textTransform: 'uppercase',
    marginLeft: 12,
    fontSize: 13,
  },
})

const stylesReceiptComponent = StyleSheet.create({
  receipt_frame: {
    borderRadius: 5,
    backgroundColor: '#f4f4f4',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  receipt_line1: {
    flexDirection: 'row',
  },
  receipt_line2: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 16,
  },
  textstyle_line1: {
    fontSize: 15,
    marginBottom: 6,
  },
  textstyle_line2: {
    fontSize: 10,
  },
})

const stylesCardComponent = StyleSheet.create({
  card_group_label: {},
  card_group_label_text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#616161',
    textAlign: 'left',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },

  cardicon: {
    borderColor: 'rgba(0, 0, 0, 1)',
    marginRight: 12,
    marginLeft: 10,
    alignSelf: 'center',
    justifyContent: `center`,
  },
  cardnumber: {
    borderColor: 'rgba(0, 0, 0, 1)',
    flex: 1,
  },
  card_exp_mo: {
    paddingRight: 5,
    width: 33,
    maxWidth: 33,
    textAlign: 'center',
  },
  oblique_bar: {},
  oblique_bar_text: {},
  card_exp_year: {
    paddingRight: 1,
    width: 30,
    maxWidth: 30,
    textAlign: 'center',
  },
  card_cvv: {
    marginRight: 16,
    marginLeft: 16,
    width: 30,
    maxWidth: 30,
    textAlign: 'center',
  },
  card_data_frame: {
    borderColor: '#e0e0e0',
    borderRadius: 4,
    borderWidth: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card_pay_button_label: {
    backgroundColor: 'rgba(223, 152, 29, 0)',
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card_pay_button: {
    borderColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 0,
    height: 36,
    borderRadius: 4,
    shadowOpacity: 0.6,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2.4,
    },
    elevation: 2,
  },
  mainframe: {
    borderWidth: 0,
  },
  s386356ab: {
    height: '20%',
    width: '80%',
  },
  loader: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_wrapper: {
    marginTop: 16,
  },
})

const stylesStatus = StyleSheet.create({
  wrapper: {
    backgroundColor: '#d30',
    padding: 16,
    borderRadius: 5,
    marginBottom: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default class StripePayment extends Component {
  static defaultProps = {
    primaryColor: '#6200ee',
    contrastColor: '#fff',
    text: 'Button',
    type: 'text',
  }

  state = {
    card_number: '',
    card_exp_mm: '',
    card_exp_yy: '',
    card_cvv: '',
    card_type_detected: '',
    paymentStatus: '',
    stripe_receipt_url: '',
    currency: 'usd',

    stripeCustomerLoaded: false,
    stripeCustomer: null,

    errorMessage: null,
    amountPaid: null,
    setupComplete: false,
    submitting: false,
  }

  componentDidMount() {
    if (!this.props.editor) {
      this.stripeVerifyConnect()
      this.fetchStripeCustomer()
    }
  }

  fetchStripeCustomer = async () => {
    let { _getUserValue: getUserValue, appId } = this.props
    let customerId = await getUserValue('stripeCustomerId')

    try {
      let stripeCustomer = (await axios.get(
        `${customerURL}/${appId}/${customerId}`
      )).data

      this.setState({
        stripeCustomer,
        stripeCustomerId: customerId,
        stripeCustomerLoaded: true,
      })
    } catch (err) {
      console.log('ENCOUNTERED ERROR:', err)
      this.setState({
        stripeCustomerLoaded: true,
      })
    }
  }

  clearSavedCard = () => {
    this.setState({
      stripeCustomer: null,
    })
  }

  getContainerStyles() {
    let { type, primaryColor } = this.props

    if (type === 'contained') {
      return { backgroundColor: primaryColor }
    }

    if (type === 'outlined') {
      let baseColor = color(primaryColor)
      let saturation = baseColor.hsl().color[1]
      let alpha = saturation <= 10 ? 0.23 : 0.5
      let borderColor = baseColor.fade(1 - alpha).toString()

      return { borderColor, borderWidth: 1 }
    }

    return {}
  }

  getTextStyles() {
    let { primaryColor, contrastColor, type } = this.props

    if (type === 'contained') {
      return { color: contrastColor }
    }

    return { color: primaryColor }
  }

  getAdditionalProps() {
    let { type } = this.props

    if (type === 'contained') {
      return { raised: true }
    }

    return {}
  }

  handleSuccess = response => {
    let { paybuttonbutton, _setUserValue: setUserValue } = this.props
    let { onSuccess } = paybuttonbutton || {}

    setUserValue('stripeCustomerId', response.data.stripe_customer_id)

    if (typeof onSuccess === 'function') {
      onSuccess()
    }
  }

  handleCardNumberChange = value => {
    this.setState({ card_number: value })

    this.setState({ card_type_detected: 'none' })

    let types = {
      test_card: /^4242424242424242/,
      amex: /^(?:3[47][0-9]{13})$/,
      visa: /^(?:4[0-9]{12}(?:[0-9]{3})?)$/,
      mastercard: /^(?:5[1-5][0-9]{14})$/,
      discover: /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/,
      dinners: /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/,
    }

    for (let cardType of Object.keys(types)) {
      if (value.match(types[cardType])) {
        this.setState({ card_type_detected: cardType })

        break
      }
    }
  }

  handleCardExpMMChange = value => this.setState({ card_exp_mm: value })

  handleCardExpYYChange = value => this.setState({ card_exp_yy: value })

  handleCardCVVChange = value => this.setState({ card_cvv: value })

  stripeValidate = async () => {
    let {
      card_number,
      card_exp_mm,
      card_exp_yy,
      card_cvv,
      stripeCustomerId,
      stripeCustomer,
      stripePublicKey,
    } = this.state

    if (!this.props.appId) {
      console.error('Platform Error: App ID not provided.')

      this.setState({
        errorMessage: 'Platform Error: App ID not provided.',
      })

      return
    }

    console.log('PUBLIC KEY:', stripePublicKey)
    if (!stripePublicKey) {
      console.error('Platform Error: stripe public key not provided.')

      this.setState({
        errorMessage: 'Platform Error: stripe public key not provided.',
      })

      return
    }

    this.setState({ submitting: true })

    const instance = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Authorization-Type': 'Bearer ' + stripePublicKey,
      },
    })

    try {
      instance.defaults.headers.common.Authorization = `Bearer ${stripePublicKey}`
      instance.defaults.headers.common['Content-Type'] =
        'application/x-www-form-urlencoded'

      const instance2 = axios.create()

      const data = qs.stringify({
        card: {
          number: card_number,
          exp_month: card_exp_mm,
          exp_year: card_exp_yy,
          cvc: card_cvv,
        },
      })

      const { amount, currency, appId } = this.props

      let tmpObject = {
        amount,
        currency,
        app_id: appId,
      }

      let chargeDescription = this.getPropsAdapted(
        'chargedescription',
        'charge_description'
      )

      let userInfoEmail = this.getPropsAdapted(
        'userinfoemail',
        'user_info_email'
      )

      if (!['', 'undefined'].includes(chargeDescription)) {
        tmpObject.statement_descriptor = chargeDescription
      }

      if (!['', 'undefined'].includes(userInfoEmail)) {
        tmpObject.receipt_email = userInfoEmail
      }

      let stripeToken

      if (!stripeCustomer) {
        let response = await instance.post(
          'https://api.stripe.com/v1/tokens',
          data
        )

        console.log(response)
        stripeToken = response.data.id
      }

      tmpObject.stripeToken = stripeToken
      tmpObject.stripeCustomerId = stripeCustomerId
      tmpObject.stripeConnectedAccountId = this.props.marketplace.stripe_connected_account_id
      tmpObject.stripePlatformFee = this.props.marketplace.stripe_platform_fee
      const data2 = qs.stringify(tmpObject)

      return instance2
        .post(paymentURL, data2)
        .then(response => {
          if (response && !response.error) {
            console.log('resp.:%s', response)

            this.setState({
              errorMessage: null,
              amountPaid: this.props.amount,
            })

            this.handleSuccess(response)
          } else {
            this.setState({
              errorMessage: UNKNOWN_ERROR,
            })

            console.log('No Response from Adalo API Server')
          }
        })
        .catch(error => {
          console.log('ERROR:', error)

          this.setState({
            submitting: false,
            errorMessage:
              (error.response && error.response.data.error_description) ||
              UNKNOWN_ERROR,
          })
        })
    } catch (error) {
      console.log('Stripe token retrieval error: %s', error.message)

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
        this.setState({
          errorMessage: error.response.data.error.message || UNKNOWN_ERROR,
          submitting: false,
        })
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        this.setState({
          errorMessage: error.message || UNKNOWN_ERROR,
          submitting: false,
        })
      }
      console.log(error.config)
    }
  }

  getPropsAdapted = (propsource, propname) => {
    let ret = 'undefined'
    if (this.props[propsource] && this.props[propsource][propname]) {
      ret = this.props[propsource][propname]
    }
    return ret
  }

  stripeVerifyConnect = () => {
    //TODO Make it configurable for deployment. That value could be fetched from the props but
    //as they are fetched when using playbook. Not sure yet.
    //const verifystripeconf_url = "https://foundry-stripe.herokuapp.com/stripestatus";
    const verifystripeconf_url = verifyURL
    //console.log("Verifying Stripe status at: %s",verifystripeconf_url + "/" + this.props.appId);
    axios
      .get(`${verifystripeconf_url}/${this.props.appId}`)
      .then(response => {
        this.setState({
          setupComplete: true,
          stripePublicKey: response.data.publishable_key,
        })
      })
      .catch(error => {
        let errmsg
        if (error.message && !error.response) {
          errmsg = `Unable to access server for Stripe status: ${error.message}`
          console.log(errmsg)
        } else if (error.response && error.response.status == 507) {
          errmsg =
            'Stripe has not been configured. Connect Stripe ID not found for user'
          console.log(errmsg)
        } else if (error.response && error.response.status == 505) {
          errmsg = 'Stripe has not been configured. Parameter appid missing'
          console.log(errmsg)
        } else if (error.response && error.response.status == 506) {
          errmsg = 'Stripe has not been configured. App ID not found'
          console.log(errmsg)
        }

        this.setState({
          errorMessage: errmsg || UNKNOWN_ERROR,
        })
      })
  }

  _goToURL() {
    console.log(`Opening URI: ${this.state.stripe_receipt_url}`)
    const url = this.state.stripe_receipt_url
    // Linking.canOpenURL(url)
    // .then(supported => {
    //     if (supported) {
    //         Linking.openURL(url);
    //     } else {
    //         console.log('Don\'t know how to open URI: ' + url);
    //     }
    // });
    console.log('Linking called')
  }

  _renderReceipt() {
    let { card_number, amountPaid } = this.state
    const { currency } = this.props

    if (amountPaid) {
      return (
        <SuccessMessage
          cardNumber={card_number}
          amount={amountPaid}
          currency={currency}
        />
      )
    } else {
      return null
    }
  }

  _renderStatus() {
    let { errorMessage, submitting } = this.state

    if (errorMessage && !submitting) {
      return <StatusMessage message={errorMessage} />
    } else {
      return null
    }
  }

  renderSavedCard() {
    let { stripeCustomer } = this.state

    if (!stripeCustomer) {
      return null
    }

    let card = stripeCustomer.sources.data[0]

    if (!card) {
      return null
    }

    let { brand, last4 } = card

    return (
      <View style={styles.savedCard}>
        <Text style={styles.savedCardDetails}>
          {`${brand} ending in •••• ${last4}`}
        </Text>
        <TouchableOpacity onPress={this.clearSavedCard}>
          <Text style={styles.changeCardButton}>Change Card</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderCardInput() {
    return (
      <View style={stylesCardComponent.card_data_frame}>
        <View verticalAlign="middle" style={stylesCardComponent.cardicon}>
          <Icon name="credit-card" size={22} color="#e0e0e0" />
        </View>
        <TextInput
          keyboardType="numeric"
          onChangeText={this.handleCardNumberChange}
          placeholder="Card Number"
          maxLength={16}
          style={[styles.input, stylesCardComponent.cardnumber]}
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={this.handleCardExpMMChange}
          placeholder="MM"
          maxLength={2}
          style={[styles.input, stylesCardComponent.card_exp_mo]}
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
        <View verticalAlign="middle" style={stylesCardComponent.oblique_bar}>
          <Text style={stylesCardComponent.oblique_bar_text}>/</Text>
        </View>
        <TextInput
          keyboardType="numeric"
          onChangeText={this.handleCardExpYYChange}
          placeholder="YY"
          maxLength={2}
          style={[styles.input, stylesCardComponent.card_exp_year]}
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={this.handleCardCVVChange}
          placeholder="CVV"
          maxLength={3}
          style={[styles.input, stylesCardComponent.card_cvv]}
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
      </View>
    )
  }

  _renderPayComponent() {
    let {
      submitting,
      errorMessage,
      setupComplete,
      amountPaid,
      stripeCustomer,
      stripeCustomerLoaded,
    } = this.state

    let { editor } = this.props

    let paybutton = this.props.paybuttonbutton || {}

    if (amountPaid) {
      return null
    }

    if (!stripeCustomerLoaded && !editor) {
      return <ActivityIndicator />
    }

    return (
      <View style={[stylesCardComponent.mainframe]}>
        <View style={stylesCardComponent.card_group_label}>
          <Text style={stylesCardComponent.card_group_label_text}>
            Credit or debit card
          </Text>
        </View>
        {stripeCustomer ? this.renderSavedCard() : this.renderCardInput()}
        <View style={stylesCardComponent.button_wrapper}>
          <TouchableOpacity onPress={this.stripeValidate} disabled={submitting}>
            <View
              style={[
                stylesCardComponent.card_pay_button,
                {
                  backgroundColor:
                    paybutton.backgroundColor || 'rgb(253, 215, 84)',
                },
              ]}
            >
              <Text
                style={[
                  stylesCardComponent.card_pay_button_label,
                  {
                    opacity: submitting ? 0 : 1,
                    color: paybutton.color || '#000',
                  },
                ]}
              >
                {this.getPropsAdapted('paybuttonbutton', 'paybuttonlabel')}
              </Text>
              {submitting ? (
                <View style={stylesCardComponent.loader}>
                  <ActivityIndicator color={paybutton.color} />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    let { icon, upperCase, app_id } = this.props

    let containerStyles = this.getContainerStyles()

    let iconStyles = this.getTextStyles()
    let textStyles = { ...this.getTextStyles() }

    if (icon) {
      textstylesCardComponent.marginRight = 5
    }

    return (
      <View style={stylesCardComponent.MainContainer}>
        {this._renderStatus()}
        {this._renderReceipt()}
        {this._renderPayComponent()}
      </View>
    )
  }
}

export class SuccessMessage extends Component {
  render() {
    let { cardNumber, amount, currency } = this.props
    const formatAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)

    return (
      //TODO Make it look better, discuss with David.
      <View style={stylesCardComponent.mainframe}>
        <View style={stylesReceiptComponent.receipt_frame}>
          <View style={stylesReceiptComponent.icon}>
            <Icon name="check-circle" size={28} color="#0a0a0a" />
          </View>
          <View style={stylesReceiptComponent.text}>
            <Text style={stylesReceiptComponent.textstyle_line1}>
              Payment Successful!
            </Text>
            <Text style={stylesReceiptComponent.textstyle_line2}>
              {`•••• •••• •••• ${cardNumber.slice(-4)} charged ${formatAmount}`}
            </Text>
          </View>
        </View>
      </View>
    )
  }
}

export class StatusMessage extends Component {
  render() {
    let { message } = this.props

    return (
      <View style={stylesStatus.wrapper}>
        <Text style={stylesStatus.text}>{message}</Text>
      </View>
    )
  }
}
