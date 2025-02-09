const babel = require("@babel/core");

const config = {
    "presets": [
        [
            "@babel/preset-react"
        ]
    ]
};

const configWithWatchPlugin = {
    ...config,
    plugins: ['./src/watcher.babel.plugin.js']
};


const removeSpaces = (str) => str.replace(/\s*/g, '');


test('Test the setup', () => {
    const {code} = babel.transformSync('(<Text></Text>)', config);
    expect(code).toBe('/*#__PURE__*/React.createElement(Text, null);');
});

test('Attribute with string value should not be watched.', () => {
    const {code} = babel.transformSync('(<Text content="test" name={"Sam"}></Text>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(Text, {' +
        '       content: "test",' +
        '       name: "Sam"' +
        '   })' +
        '});')
    );
});

test('Attribute with number value should not be watched.', () => {
    const {code} = babel.transformSync('(<Text maxLength={4}></Text>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(Text, {' +
        '       maxLength: 4' +
        '   })' +
        '});')
    );
});

test('Attribute with boolean value should not be watched.', () => {
    const {code} = babel.transformSync('(<Text disabled={true}></Text>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(Text, {' +
        '       disabled: true' +
        '   })' +
        '});')
    );
});

test('Attribute with Object value should not be watched.', () => {
    const {code} = babel.transformSync('(<Text style={{color: \'red\'}}></Text>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(Text, {' +
        '       style: {color: \'red\'}' +
        '   })' +
        '});')
    );
});

test('Attribute with null value should not be watched.', () => {
    const {code} = babel.transformSync('(<Text style={null}></Text>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(Text, {' +
        '       style: null' +
        '   })' +
        '});')
    );
});



test('Attribute with array value should be watched.', () => {
    const {code} = babel.transformSync('(<List data={[1, 2, 3]}></List>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(List, {' +
        '       data: watch(() => [1, 2, 3])' +
        '   })' +
        '});')
    );
});

test('Attribute with JSX expression should be watched.', () => {
    const {code} = babel.transformSync('(<Text content={firstname + lastname} name="fullname" ></Text>)', configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        'import RNinja from "react-ninja";' +
        '/*#__PURE__*/React.createElement("RNinja.PropsWatcher", {' +
        '    render: watch => /*#__PURE__*/React.createElement(Text, {' +
        '       content: watch(() => firstname + lastname),' +
        '       name: "fullname"' +
        '   })' +
        '});')
    );
});


test('Watchers should be added across JSX DOM.', () => {
    const {code} = babel.transformSync(`(
        <div>
            <Text content={'Hello ' + name + '!'} name="fullname" ></Text>
            <Input value={name}></Input>
        </div>
        )`, configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(
        `import RNinja from "react-ninja";
        /*#__PURE__*/React.createElement("RNinja.PropsWatcher", {
        render: watch => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("RNinja.PropsWatcher", {
            render: watch => /*#__PURE__*/React.createElement(Text, {
            content: watch(() => 'Hello ' + name + '!'),
            name: "fullname"
            })
        }), /*#__PURE__*/React.createElement("RNinja.PropsWatcher", {
            render: watch => /*#__PURE__*/React.createElement(Input, {
            value: watch(() => name)
            })
        }))
    });`));
});

test('Trigger UI Refresh after every callback.', () => {
    const {code} = babel.transformSync(`(
        <Text 
            render={() => (<Box render={() => (<Text></Text>)}></Box>)}
            onClick={() => submit()} 
            onBlur={() => validate()} 
            onInit={() => {init();}}></Text>)`, configWithWatchPlugin);
    expect(removeSpaces(code)).toBe(removeSpaces(`
        import RNinja from "react-ninja"; /*#__PURE__*/
        
        React.createElement("RNinja.PropsWatcher", {
            render: watch => /*#__PURE__*/ React.createElement(Text, {
                render: () => /*#__PURE__*/ React.createElement("RNinja.PropsWatcher", {
                    render: watch => /*#__PURE__*/ React.createElement(Box, {
                        render: () => /*#__PURE__*/ React.createElement("RNinja.PropsWatcher", {
                            render: watch => /*#__PURE__*/ React.createElement(Text, null)
                        })
                    })
                }),
                onClick: () => {
                    RNinja.check();
                    return submit();
                },
                onBlur: () => {
                    RNinja.check();
                    return validate();
                },
                onInit: () => {
                    RNinja.check();
                    init();
                }
            })
        });`)
    );
});
