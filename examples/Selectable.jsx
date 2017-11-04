import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import Table from '../src';
import Checkbox from './Checkbox';
import styles from './index.styl';

class Selectable extends PureComponent {
    static propTypes = {
        data: PropTypes.array,
        onUpdateStart: PropTypes.func,
        onUpdateEnd: PropTypes.func
    };

    state = {
        page: 1,
        topHeight: 0,
        bottomHeight: 0,
        data: this.props.data
    };
    node = {
        checkbox: null
    };

    toggleAll = () => {
        if (!this.node.checkbox) {
            return;
        }

        const node = ReactDOM.findDOMNode(this.node.checkbox);
        const checked = node.checked;
        this.setState(state => ({
            data: state.data.map(item => ({
                ...item,
                checked: !checked
            }))
        }));
    };
    renderHeaderCheckbox = () => {
        const dataLength = this.state.data.length;
        const selectedLength = this.state.data.filter(data => !!data.checked).length;
        const checked = selectedLength > 0;
        const indeterminate = selectedLength > 0 && selectedLength < dataLength;

        return (
            <Checkbox
                ref={node => {
                    this.node.checkbox = node;
                }}
                checked={checked}
                indeterminate={indeterminate}
                onChange={event => {
                    const checkbox = event.target;
                    const checked = !!checkbox.checked;

                    this.setState(state => ({
                        data: state.data.map(item => ({
                            ...item,
                            checked: checked
                        }))
                    }));
                }}
            />
        );
    };
    getRowClassName = (record, key) => {
        const checked = record.checked;
        if (checked) {
            return styles.active;
        } else {
            return null;
        }
    };
    onRowClick = (record, index, e) => {
        const checked = record.checked;
        this.setState(state => ({
            data: state.data.map(item => {
                if (record.id === item.id) {
                    return {
                        ...item,
                        checked: !checked
                    };
                }
                return item;
            })
        }));
    };

    columns = [
        {
            title: this.renderHeaderCheckbox,
            dataKey: 'checked',
            render: (value, row) => (
                <Checkbox
                    id={row.id}
                    className="input-checkbox"
                    checked={row.checked}
                />
            ),
            width: 38
        },
        {
            title: '#',
            dataKey: 'id'
        },
        {
            title: 'Event Type',
            dataKey: 'eventType'
        },
        {
            title: 'Affected Devices',
            dataIndex: 'affectedDevices'
        },
        {
            title: 'Detections',
            dataIndex: 'detections'
        }
    ];

    componentWillUpdate() {
        this.props.onUpdateStart();
    }
    componentDidUpdate() {
        this.props.onUpdateEnd();
    }

    componentDidMount() {
        const el = findDOMNode(this);
        const theadHeight = el.querySelector('[class^="thead---"]').offsetHeight;
        const rowHeight = el.querySelector('[class^="tbody---"] [class^="tr---"]').offsetHeight;
        const total = this.state.data.length;
        const fullHeight = total * rowHeight + theadHeight;

        this.fullHeight = fullHeight - el.clientHeight;
        this.rowHeight = rowHeight;
        this.rowsHeight = rowHeight * this.rows;
        this.theadHeight = theadHeight;

        this.setState({
            bottomHeight: this.fullHeight
        });
    }

    skip = false
    range = 30
    rows = 10
    lastScrollTop = 0

    handleScroll = (ev) => {
        const { scrollTop } = ev.currentTarget;
        const { page } = this.state;

        const scrollDir = scrollTop < this.lastScrollTop ? 'u' : 'd';
        const pagesHeight = this.rowsHeight * page + this.theadHeight * page;

        console.log({
            page,
            scrollTop,
            pagesHeight,
            up: pagesHeight - this.rowsHeight
        });

        if (scrollDir === 'd' && scrollTop >= pagesHeight) {
            const topHeight = pagesHeight;
            this.setState({
                page: page + 1,
                topHeight,
                bottomHeight: this.fullHeight - topHeight
            });
        } else if (scrollDir === 'u' && page > 1 && scrollTop <= pagesHeight - this.rowsHeight) {
            const p = page - 1;
            const topHeight = this.rowsHeight * (p - 1);
            this.setState({
                page: p,
                topHeight,
                bottomHeight: this.fullHeight - topHeight
            });
        }

        this.lastScrollTop = scrollTop;
    }
    render() {
        const { page, topHeight, bottomHeight } = this.state;

        const from = this.rows * (page - 1);
        const end = from + this.range;

        return (
            <div
                className={styles.root}
                onScroll={this.handleScroll}
            >

                <div style={{ height: topHeight }} />
                <Table
                    justified={false}
                    rowKey="id"
                    columns={this.columns}
                    data={this.state.data.slice(from, end)}
                    rowClassName={this.getRowClassName}
                    onRowClick={this.onRowClick}
                    // maxHeight={400}
                    style={{
                        overflow: 'hidden'
                    }}
                />
                <div style={{ height: bottomHeight }} />
            </div>

        );
    }

}

export default Selectable;
