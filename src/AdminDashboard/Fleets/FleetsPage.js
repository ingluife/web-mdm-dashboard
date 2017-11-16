import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Calc100PercentMinus from '../../Utils/Calc100PercentMinus'
import IconItemList from '../IconItemList'

export default class FleetsPage extends Component {

    render() {
        if (this.props.selectedIndex === null) {
            return (
                <div className="contentPane" style={{ height: '100%', width: Calc100PercentMinus(this.props.itemListPaneWidth), display: 'inline-block', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <h1 className="win-h1" style={{ color: 'grey' }}>No Selection</h1>
                    </div>
                </div>
            )
        } else {
            let selectedItemList = this.props.itemList.getAt(this.props.selectedIndex)
            return (
                <div className="contentPane" style={{ height: '100%', width: Calc100PercentMinus(this.props.itemListPaneWidth), display: 'inline-block', verticalAlign: 'top' }}>
                    <div className="contentHeader">
                        <div className="name">{selectedItemList["PluginFlyvemdmFile.name"]}</div>
                        <div className="itemInfo">
                            <IconItemList size={72} />
                            <div className="contentStatus">
                                <span className="source">{selectedItemList["PluginFlyvemdmFile.source"]}</span>
                            </div>
                        </div>
                    </div>
                    <div className="separator" />
                </div>
            )
        }
    }
}
FleetsPage.propTypes = {
    itemListPaneWidth: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    selectedIndex: PropTypes.number,
    itemList: PropTypes.object.isRequired
}
