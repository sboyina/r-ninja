import React, { useEffect } from "react";

export const When = (props: {
    condition: boolean | undefined,
    onTrue: () => React.ReactNode,
    onFalse?: () => React.ReactNode
}) =>  {
    return props.condition ? props.onTrue() : (props.onFalse && props.onFalse());
};