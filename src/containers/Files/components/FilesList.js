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
import ReactWinJS from 'react-winjs'
import WinJS from 'winjs'
import I18n from '../../../shared/i18n'
import FilesItemList from './FilesItemList'
import Loader from '../../../components/Loader'
import Confirmation from '../../../components/Confirmation'
import EmptyMessage from '../../../components/EmptyMessage'
import itemtype from '../../../shared/itemtype'
import publicURL from '../../../shared/publicURL'
import handleMessage from '../../../shared/handleMessage'

/**
 * @class FilesList
 * @extends PureComponent
 */
class FilesList extends PureComponent {
  /** Item list render */
  ItemListRenderer = ReactWinJS.reactRenderer(ItemList => (
    <FilesItemList
      itemList={ItemList.data}
      size={42}
    />
  ))

  /** @constructor */
  constructor(props) {
    super(props)
    this.state = {
      layout: {
        type: WinJS.UI.ListLayout,
      },
      isLoading: false,
      isLoadingMore: false,
      itemList: new WinJS.Binding.List([]),
      order: 'ASC',
      totalcount: 0,
      pagination: {
        start: 0,
        page: 1,
        count: 15,
      },
    }
  }

  componentDidMount() {
    this.handleRefresh()
  }

  componentDidUpdate(prevProps) {
    const {
      totalcount,
      pagination,
      isLoadingMore,
    } = this.state
    const {
      action,
      changeAction,
      selectedItems,
      selectionMode,
    } = this.props

    if (this.listView) {
      this.listView.winControl.footer.style.outline = 'none'
      this.listView.winControl.footer.style.height = totalcount > (pagination.page * pagination.count) ? isLoadingMore ? '100px' : '42px' : '1px'
    }
    if (this.toolBar) {
      this.toolBar.winControl.forceLayout();
    }

    if (action === 'reload') {
      this.handleRefresh()
      changeAction(null)
    }

    if (prevProps.selectedItems.length > 0 && selectedItems.length === 0 && !selectionMode) {
      if (this.listView) {
        this.listView.winControl.selection.clear()
      }
    }
  }

  componentWillUnmount() {
    const { changeSelectionMode } = this.props

    changeSelectionMode(false)
  }

  /**
   * handle fetch files
   * @async
   * @function handleRefresh
   */
  handleRefresh = () => {
    const {
      history,
      glpi,
    } = this.props
    const {
      order,
      pagination,
    } = this.state

    history.push(`${publicURL}/app/files`)
    this.setState({
      isLoading: true,
      totalcount: 0,
      pagination: {
        start: 0,
        page: 1,
        count: 15,
      },
    }, async () => {
      try {
        const files = await glpi.searchItems({
          itemtype: itemtype.PluginFlyvemdmFile,
          options: {
            uid_cols: true,
            forcedisplay: [1, 2, 3],
            order,
            range: `${pagination.start}-${(pagination.count * pagination.page) - 1}`,
          },
        })
        this.setState({
          order: files.order,
          itemList: new WinJS.Binding.List(files.data),
          isLoading: false,
          totalcount: files.totalcount,
        })
      } catch (error) {
        handleMessage({ message: error })
        this.setState({
          isLoading: false,
          order: 'ASC',
        })
      }
    })
  }

  /**
   * handle edit selected files
   * @function handleEdit
   */
  handleEdit = () => {
    const { history } = this.props

    const path = `${publicURL}/app/files/edit`
    history.push(path)
  }

  /**
   * handle add new files
   * @function handleAdd
   */
  handleAdd = () => {
    const {
      history,
      changeSelectionMode,
      changeSelectedItems,
    } = this.props

    history.push(`${publicURL}/app/files/add`)
    changeSelectionMode(false)
    changeSelectedItems([])
    if (this.listView) {
      this.listView.winControl.selection.clear()
    }
  }

  /**
   * handle change selection mode
   * @function handleToggleSelectionMode
   */
  handleToggleSelectionMode = () => {
    const {
      history,
      changeSelectionMode,
      changeSelectedItems,
      selectionMode,
    } = this.props

    history.push(`${publicURL}/app/files`)
    changeSelectionMode(!selectionMode)
    changeSelectedItems([])
    if (this.listView) {
      this.listView.winControl.selection.clear()
    }
  }

  /**
   * handle show datail selected files
   * @function handleSelectionChanged
   * @param {object} eventObject
   */
  handleSelectionChanged = (eventObject) => {
    const {
      changeSelectedItems,
      history,
      selectionMode,
    } = this.props
    const { itemList } = this.state

    const listView = eventObject.currentTarget.winControl
    const index = listView.selection.getIndices()
    const itemSelected = []

    for (const item of index) {
      itemSelected.push(itemList.getItem(item).data)
    }
    changeSelectedItems(itemSelected)
    if (index.length === 1 && !selectionMode) {
      history.push(`${publicURL}/app/files/${itemSelected[0]['PluginFlyvemdmFile.id']}`)
    }
    if (index.length > 1 && !selectionMode) {
      history.push(`${publicURL}/app/files/edit/`)
    }
  }

  /**
   * handle delete selected files
   * @function handleSelectionChanged
   * @param {object} eventObject
   */
  handleDelete = async () => {
    const {
      selectedItems,
      glpi,
      changeSelectionMode,
      changeSelectedItems,
      changeAction,
      handleMessage,
    } = this.props

    const isOK = await Confirmation.isOK(this.contentDialog)
    if (isOK) {
      const itemListToDelete = selectedItems.map(item => ({
        id: item['PluginFlyvemdmFile.id'],
      }))

      this.setState({
        isLoading: true,
      }, async () => {
        try {
          await glpi.deleteItem({
            itemtype: itemtype.PluginFlyvemdmFile,
            input: itemListToDelete,
            queryString: {
              force_purge: true,
            },
          })

          this.props.toast.setNotification({
            title: I18n.t('commons.success'),
            body: I18n.t('notifications.device_successfully_removed'),
            type: 'success',
          })
          changeSelectionMode(false)
          changeSelectedItems([])
          changeAction('reload')
        } catch (error) {
          this.props.toast.setNotification(handleMessage({
            type: 'alert',
            message: error,
          }))
          changeSelectionMode(false)
          changeSelectedItems([])
          this.setState({
            isLoading: false,
          })
        }
      })
    } else {
      changeSelectionMode(false)
      changeSelectedItems([])
      if (this.listView) {
        this.listView.winControl.selection.clear()
      }
    }
  }

  /**
   * handle sort item list files
   * @async
   * @function handleSort
   */
  handleSort = async () => {
    const { order } = this.state
    const {
      glpi,
      history,
    } = this.props

    try {
      this.setState({
        isLoading: true,
        pagination: {
          start: 0,
          page: 1,
          count: 15,
        },
      })
      const newOrder = order === 'ASC' ? 'DESC' : 'ASC'

      const files = await glpi.searchItems({
        itemtype: itemtype.PluginFlyvemdmFile,
        options: {
          uid_cols: true,
          order: newOrder,
          forcedisplay: [1, 2, 3],
        },
      })

      this.setState({
        isLoading: false,
        order: files.order,
        totalcount: files.totalcount,
        itemList: new WinJS.Binding.List(files.data),
      })
      history.push(`${publicURL}/app/files`)
    } catch (error) {
      this.setState({
        isLoading: false,
        order: 'ASC',
      })
    }
  }

  /**
   * handle load more data
   * @async
   * @function loadMoreData
   * @param {object} eventObject
   */
  loadMoreData = async () => {
    const {
      pagination,
      totalcount,
      order,
      itemList,
    } = this.state
    const { glpi } = this.props

    try {
      this.setState({
        isLoadingMore: true,
      })
      const range = {
        from: pagination.count * pagination.page,
        to: (pagination.count * (pagination.page + 1)) - 1,
      }
      if (range.from <= totalcount) {
        for (const key in range) {
          if (Object.prototype.hasOwnProperty.call(range, key)) {
            if (range[key] >= totalcount) { range[key] = totalcount - 1 }
          }
        }
        const files = await glpi.searchItems({
          itemtype: itemtype.PluginFlyvemdmFile,
          options: {
            uid_cols: true,
            forcedisplay: [1, 2, 3],
            order,
            range: `${range.from}-${range.to}`,
          },
        })

        for (const item in files.data) {
          if (Object.prototype.hasOwnProperty.call(files.data, item)) {
            itemList.push(files.data[item])
          }
        }

        this.setState({
          isLoadingMore: false,
          totalcount: files.totalcount,
          pagination: {
            ...pagination,
            page: pagination.page + 1,
          },
        })
      }
    } catch (error) {
      this.setState({
        isLoadingMore: false,
      })
    }
  }

  render() {
    const {
      selectedItems,
      selectionMode,
      icon,
    } = this.props
    const {
      isLoadingMore,
      isLoading,
      itemList,
      layout,
    } = this.state

    const deleteCommand = (
      <ReactWinJS.ToolBar.Button
        key="delete"
        icon="delete"
        label={I18n.t('commons.delete')}
        priority={0}
        disabled={selectedItems.length === 0}
        onClick={this.handleDelete}
      />
    )

    const editCommand = (
      <ReactWinJS.ToolBar.Button
        key="edit"
        icon="edit"
        label={I18n.t('commons.edit')}
        priority={0}
        disabled={selectedItems.length === 0}
        onClick={this.handleEdit}
      />
    )

    const footerComponent = isLoadingMore
      ? <Loader />
      : (
        <div
          onClick={this.loadMoreData}
          style={{ cursor: 'pointer', color: '#158784' }}
          role="button"
          tabIndex="0"
        >
          <span
            className="refreshIcon"
            style={{ padding: '10px', fontSize: '20px' }}
          />
          <span>
            {I18n.t('commons.load_more')}
          </span>
        </div>
      )

    let listComponent

    if (isLoading) {
      listComponent = <Loader count={3} />
    } else if (itemList && itemList.length > 0) {
      listComponent = (
        <ReactWinJS.ListView
          ref={(listView) => { this.listView = listView }}
          className="list-pane__content win-selectionstylefilled"
          style={{ height: 'calc(100% - 48px)' }}
          itemDataSource={itemList.dataSource}
          layout={layout}
          itemTemplate={this.ItemListRenderer}
          footerComponent={footerComponent}
          selectionMode={selectionMode ? 'multi' : 'single'}
          tapBehavior={selectionMode ? 'toggleSelect' : 'directSelect'}
          onSelectionChanged={this.handleSelectionChanged}
        />
      )
    } else {
      listComponent = (
        <EmptyMessage
          message={I18n.t('files.not_found')}
          icon={icon}
          showIcon
        />
      )
    }

    return (
      <React.Fragment>
        <ReactWinJS.ToolBar ref={(toolBar) => { this.toolBar = toolBar }} className="listToolBar">
          <ReactWinJS.ToolBar.Button
            key="sort"
            icon="sort"
            label={I18n.t('commons.sort')}
            priority={1}
            onClick={this.handleSort}
          />
          <ReactWinJS.ToolBar.Button
            key="refresh"
            icon="refresh"
            label={I18n.t('commons.refresh')}
            priority={1}
            onClick={this.handleRefresh}
          />

          <ReactWinJS.ToolBar.Button
            key="add"
            icon="add"
            label={I18n.t('commons.add')}
            priority={0}
            onClick={this.handleAdd}
          />

          {selectionMode ? editCommand : null}
          {selectionMode ? deleteCommand : null}

          <ReactWinJS.ToolBar.Toggle
            key="select"
            icon="bullets"
            label={I18n.t('commons.select')}
            priority={0}
            selected={selectionMode}
            onClick={this.handleToggleSelectionMode}
          />
        </ReactWinJS.ToolBar>

        { listComponent }

        <Confirmation
          title={I18n.t('files.delete')}
          message={`${selectedItems.length} ${I18n.t('files.delete_message')}`}
          reference={(el) => { this.contentDialog = el }}
        />
      </React.Fragment>
    )
  }
}
FilesList.defaultProps = {
  action: null,
}

/** FilesList propTypes */
FilesList.propTypes = {
  selectedItems: PropTypes.array.isRequired,
  changeSelectedItems: PropTypes.func.isRequired,
  selectionMode: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  changeSelectionMode: PropTypes.func.isRequired,
  action: PropTypes.string,
  changeAction: PropTypes.func.isRequired,
  toast: PropTypes.object.isRequired,
  glpi: PropTypes.object.isRequired,
  icon: PropTypes.string.isRequired,
}

export default FilesList
