import React, { ReactNode, useEffect } from "react";

export function Repeat<T>(props: {
    data: T[],
    keyExtractor? : (item: T, index: number) => any,
    renderItem: (item: T, index: number) => React.ReactNode
}) {
    const [cachedItems, setCachedItems] = React.useState<{
        item: T,
        key: any,
        node: ReactNode
    }[]>([]);
    const [ keyPrefix, setKeyPrefix ] = React.useState<any>(1);
    useEffect(() => {
        setKeyPrefix(Date.now());
    }, [props.data]);
    const RepeatNode = props.data.map((item, index) => {
        const key = keyPrefix + ':' 
            + index + ':' 
            + (props.keyExtractor ? props.keyExtractor(item, index) : index); 
        let cachedItem = cachedItems.find(x => x.key === key);
        if (cachedItem) {
            cachedItem.item = item;
        } else {
            cachedItem = {
                item,
                key,
                node: props.renderItem(item, index)
            };
            cachedItems.splice(index, 0, cachedItem)
        }
        return (
            <React.Fragment key={key}>
                {cachedItem.node}
            </React.Fragment>
        );
    });
    cachedItems.splice(props.data.length - 1, cachedItems.length - props.data.length);
    return RepeatNode;
};