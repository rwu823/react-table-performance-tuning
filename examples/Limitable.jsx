import React, { Component, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';
import styled from 'styled-components';
import { number } from 'prop-types';

const PaddingTop = styled.div`
  height: ${props => props.height || 0}px;
`;

const PaddingBottom = styled.div`
  height: ${props => props.height || 0}px;
`;

class Limitable extends Component {

    constructor(props) {
        super(props);

        this.cacheData = Array.from(this.props.children.props.data);
    }

    state = {
        page: 1,
        topHeight: 0,
        bottomHeight: 0
    };

    static propTypes = {
        limit: number.isRequired
    };

    static defaultProps = {};

    componentDidMount() {
        const table = findDOMNode(this.tableChild);
        const theadHeight = table.querySelector('[class^="thead---"]').clientHeight;
        const rowHeight = table.querySelector('[class^="tbody---"] [class^="tr---"]').clientHeight;

        const total = this.cacheData.length;

        const fullHeight = total * rowHeight + theadHeight;

        this.setState({
            bottomHeight: fullHeight - this.el.clientHeight
        });
    }

    componentWillReceiveProps(newProps) {

    }

    render() {
        const { children, limit } = this.props;
        const { page, topHeight, bottomHeight } = this.state;

        const end = page * limit;
        const from = end - limit;

        return (
            <div ref={el => (this.el = el)}>
                <PaddingTop height={topHeight} />
                {cloneElement(children, {
                    ref: el => (this.tableChild = el),
                    data: this.cacheData.slice(from, end)
                })}
                <PaddingBottom height={bottomHeight} />
            </div>
        );
    }
}


export default Limitable;
