/*
 *   Copyright © 2018 Teclib. All rights reserved.
 *
 *   This file is part of web-mdm-dashboard
 *
 * web-mdm-dashboard is a subproject of Flyve MDM. Flyve MDM is a mobile
 * device management software.
 *
 * Flyve MDM is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * Flyve MDM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * ------------------------------------------------------------------------------
 * @author     Gianfranco Manganiello (gmanganiello@teclib.com)
 * @author     Hector Rondon (hrondon@teclib.com)
 * @copyright  Copyright © 2018 Teclib. All rights reserved.
 * @license    GPLv3 https://www.gnu.org/licenses/gpl-3.0.html
 * @link       https://github.com/flyve-mdm/web-mdm-dashboard
 * @link       http://flyve.org/web-mdm-dashboard
 * @link       https://flyve-mdm.com
 * ------------------------------------------------------------------------------
 */

/** import dependencies */
import React, {
  PureComponent,
} from 'react'
import PropTypes from 'prop-types'
import routes from './routes'
import withGLPI from '../../hoc/withGLPI'
import withHandleMessages from '../../hoc/withHandleMessages'
import GenerateRoutes from '../../components/GenerateRoutes'
import InvitationsList from './components/InvitationsList'
import getMode from '../../shared/getMode'
import calc100PercentMinus from '../../shared/calc100PercentMinus'
import publicURL from '../../shared/publicURL'

/**
 * Component with the Invitations section
 * @class Invitations
 * @extends PureComponent
 */
class Invitations extends PureComponent {
  /** @constructor */
  constructor(props) {
    super(props)
    this.state = {
      icon: 'emailIcon',
      mode: getMode(),
      itemListPaneWidth: getMode() === 'small' ? '100%' : 320,
      selectionMode: false,
      action: null,
      selectedItems: [],
    }
    window.addEventListener('resize', this.handleResize)
  }

  /**
   * Remove event listener 'resize'
   * @function componentWillUnmount
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  /**
   * Make sure that the state and props are in sync for when it is required
   * @function getDerivedStateFromProps
   * @static
   * @param {object} nextProps
   * @param {object} prevState
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.history.location.pathname === `${publicURL}/app/invitations` && prevState.selectedItems.length > 0 && prevState.selectionMode === false) {
      return {
        ...prevState,
        selectedItems: [],
      }
    }
    return {
      ...prevState,
    }
  }

  /**
   * Change state according to the resolution of the screen
   * @function handleResize
   */
  handleResize = () => {
    const { mode } = this.state
    const nextMode = getMode()

    if (nextMode === 'small') {
      this.setState({
        itemListPaneWidth: '100%',
      })
    } else {
      this.setState({
        itemListPaneWidth: 320,
      })
    }
    if (mode !== nextMode) {
      this.setState({
        mode: nextMode,
      })
    }
  }

  /**
   * Construct the props data
   * @function propsData
   * @return {object}
   */
  propsData = () => {
    const {
      icon,
      selectionMode,
      action,
      selectedItems,
    } = this.state
    const {
      toast,
      history,
      glpi,
      handleMessage,
    } = this.props

    return ({
      icon,
      changeSelectionMode: this.changeSelectionMode,
      selectionMode,
      selectedItems,
      changeSelectedItems: this.changeSelectedItems,
      action,
      changeAction: this.changeAction,
      toast,
      history,
      glpi,
      handleMessage,
    })
  }

  /**
   * Change selected items
   * @function changeSelectedItems
   * @param {array} selectedItems
   */
  changeSelectedItems = selectedItems => this.setState({
    selectedItems,
  })

  /**
   * Change action
   * @function changeAction
   * @param {*} action
   */
  changeAction = action => this.setState({
    action,
  })

  /**
   * Change selection mode
   * @function changeSelectionMode
   * @param {boolean} selectionMode
   */
  changeSelectionMode = selectionMode => this.setState({
    selectionMode,
  })

  /**
   * Construct the styles of the list
   * @function stylesList
   * @return {object}
   */
  stylesList = () => {
    const {
      itemListPaneWidth,
      mode,
      selectedItems,
      selectionMode,
    } = this.state
    const { history } = this.props

    const styles = {
      width: itemListPaneWidth,
    }
    if (mode === 'small') {
      if ((selectedItems.length === 0 && history.location.pathname
          === `${publicURL}/app/invitations`)
        || history.location.pathname === `${publicURL}/app/invitations`
        || (history.location.pathname === `${publicURL}/app/invitations`
          && selectionMode)) {
        styles.display = 'inline-block'
      } else {
        styles.display = 'none'
      }
    } else {
      styles.display = 'inline-block'
    }

    return styles
  }

  /**
   * Construct the styles of the content
   * @function stylesContent
   * @return {object}
   */
  stylesContent = () => {
    const {
      itemListPaneWidth,
      mode,
      selectedItems,
      selectionMode,
    } = this.state
    const { history } = this.props

    const validWidth = itemListPaneWidth === '100%' ? 0 : itemListPaneWidth
    const styles = {
      width: calc100PercentMinus(validWidth),
      height: '100%',
    }

    if (mode === 'small') {
      if ((selectedItems.length === 0 && history.location.pathname
          === `${publicURL}/app/invitations`)
        || history.location.pathname === `${publicURL}/app/invitations`
        || (history.location.pathname === `${publicURL}/app/invitations`
          && selectionMode)) {
        styles.display = 'none'
      } else {
        styles.display = 'inline-flex'
      }
    } else {
      styles.display = 'inline-flex'
    }

    return styles
  }

  /**
   * Render component
   * @function render
   */
  render() {
    const { match } = this.props

    const renderComponents = (
      <React.Fragment>
        <div className="list-pane flex-block__list" style={{ ...this.stylesList() }}>
          <InvitationsList
            key="list"
            {...this.propsData()}
          />
        </div>
        <div className="flex-block__content" style={{ ...this.stylesContent() }}>
          <GenerateRoutes
            key="content"
            routes={routes}
            rootPath={match.url}
            {...this.propsData()}
          />
        </div>
      </React.Fragment>
    )

    return (
      <div className="flex-block flex-block--with-scroll">
        {renderComponents}
      </div>
    )
  }
}

Invitations.propTypes = {
  match: PropTypes.object.isRequired,
  toast: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  glpi: PropTypes.object.isRequired,
  handleMessage: PropTypes.func.isRequired,
}

export default withGLPI(Invitations)
