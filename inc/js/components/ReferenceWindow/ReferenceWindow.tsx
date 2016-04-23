import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from '../../utils/Modal';
import { ReferenceWindowEvents as LocalEvents, ManualDataObj } from '../../utils/Constants';
import { toTitleCase } from '../../utils/HelperFunctions';
const citeStyles = require('../../../../vendor/CitationStylesObj.js');

import { ManualEntryContainer } from './Components/ManualEntryContainer';

interface DOMEvent extends UIEvent {
    target: HTMLInputElement
}

interface State {
    identifierList: string
    citationStyle: string
    includeLink: boolean
    attachInline: boolean
    addManually: boolean
    people: CSL.TypedPerson[]
    manualData: CSL.Data
}


class ReferenceWindow extends React.Component<{}, State> {

    private modal: Modal = new Modal('Insert Formatted Reference');

    constructor() {
        super();
        this.state = {
            identifierList: '',
            citationStyle: top.tinyMCE.activeEditor.windowManager.windows[0].settings.params.preferredStyle || 'american-medical-association',
            includeLink: false,
            attachInline: false,
            addManually: false,
            people: [
                { given: '', family: '', type: 'author', },
            ],
            manualData: ManualDataObj,
        }
    }

    componentDidMount() {
        this.modal.resize();
    }

    componentDidUpdate() {
        this.modal.resize();
    }

    handleSubmit(e: Event) {
        e.preventDefault();
        let wm = top.tinyMCE.activeEditor.windowManager;
        wm.setParams({ data: this.state });
        wm.close();
    }

    consumeChildEvents(e: CustomEvent) {
        switch (e.type) {
            case LocalEvents.IDENTIFIER_FIELD_CHANGE: {
                this.setState(
                    Object.assign({}, this.state, {
                        identifierList: e.detail
                    })
                );
                return;
            }
            case LocalEvents.PUBMED_DATA_SUBMIT: {
                let newList: string = e.detail;

                // If the current PMID List is not empty, add PMID to it
                if (this.state.identifierList !== '') {
                    let combinedInput: string[] = this.state.identifierList.split(',');
                    combinedInput.push(newList);
                    newList = combinedInput.join(',');
                }

                this.setState(Object.assign({}, this.state, { identifierList: newList }));
                return;
            }
            case LocalEvents.TOGGLE_MANUAL: {
                this.setState(
                    Object.assign({}, this.state, {
                        addManually: !this.state.addManually,
                    })
                );
                return;
            }
            case LocalEvents.TOGGLE_INCLUDE_LINK: {
                this.setState(
                    Object.assign({}, this.state, {
                        includeLink: !this.state.includeLink
                    })
                );
                return;
            }
            case LocalEvents.ADD_PERSON: {
                this.setState(
                    Object.assign({}, this.state, {
                        people: [
                            ...this.state.people,
                            { given: '', family: '', type: 'author', },
                        ],
                    })
                );
                return;
            }
            case LocalEvents.REMOVE_PERSON: {
                this.setState(
                    Object.assign({}, this.state, {
                        people: [
                            ...this.state.people.slice(0, e.detail),
                            ...this.state.people.slice(e.detail + 1)
                        ]
                    })
                );
                return;
            }
            case LocalEvents.PERSON_CHANGE: {
                let people = [...this.state.people];
                people[e.detail.index][e.detail.field] = e.detail.value;
                this.setState(
                    Object.assign({}, this.state, {
                        people
                    })
                );
                return;
            }
            case LocalEvents.TOGGLE_INLINE_ATTACHMENT: {
                this.setState(
                    Object.assign({}, this.state, { attachInline: !this.state.attachInline })
                );
                return;
            }
            case LocalEvents.CHANGE_CITATION_STYLE: {
                this.setState(
                    Object.assign({}, this.state, { citationStyle: e.detail })
                );
                return;
            }
            case LocalEvents.CHANGE_CITATION_TYPE: {
                this.setState(
                    Object.assign({}, this.state, {
                        manualData: Object.assign({}, ManualDataObj, { type: e.detail })
                    })
                );
                return;
            }
            case LocalEvents.META_FIELD_CHANGE: {
                this.setState(
                    Object.assign({}, this.state, {
                        manualData: Object.assign({}, this.state.manualData, {
                            [e.detail.field]: e.detail.value,
                        })
                    })
                );
                return;
            }
        }
    }

    render() {
        return(
            <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    { !this.state.addManually &&
                        <IdentifierInput
                            identifierList={this.state.identifierList}
                            eventHandler={this.consumeChildEvents.bind(this)} />
                    }
                    { this.state.addManually &&
                        <ManualEntryContainer
                            manualData={this.state.manualData}
                            people={this.state.people}
                            eventHandler={this.consumeChildEvents.bind(this)} />
                    }
                    <RefOptions
                        attachInline={this.state.attachInline}
                        citationStyle={this.state.citationStyle}
                        eventHandler={this.consumeChildEvents.bind(this)} />
                    <ActionButtons
                        addManually={this.state.addManually}
                        eventHandler={this.consumeChildEvents.bind(this)} />
                </form>
            </div>
        );
    }
}


interface IdentifierInputProps {
    identifierList: string
    eventHandler: Function
}

class IdentifierInput extends React.Component<IdentifierInputProps,{}> {

    refs: {
        [key: string]: Element
        identifierField: HTMLInputElement
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        (ReactDOM.findDOMNode(this.refs.identifierField) as HTMLInputElement).focus()
    }

    handleChange(e: DOMEvent) {
        this.props.eventHandler(
            new CustomEvent(LocalEvents.IDENTIFIER_FIELD_CHANGE, { detail: e.target.value })
        );
    }

    handleLinkToggle() {
        this.props.eventHandler(
            new CustomEvent(LocalEvents.TOGGLE_INCLUDE_LINK)
        );
    }

    render() {
        return(
            <div className='row' style={{display: 'flex', alignItems: 'center'}}>
                <div style={{ padding: '5px', }}>
                    <label
                        htmlFor='identifierList'
                        children='PMID/DOI' />
                </div>
                <input
                    type='text'
                    id='identifierList'
                    style={{ width: '100%', }}
                    onChange={this.handleChange.bind(this)}
                    ref='identifierField'
                    required={true}
                    value={this.props.identifierList} />
                <div style={{ padding: '5px', }}>
                    <label
                        style={{ whiteSpace: 'nowrap', }}
                        htmlFor='includeLink'
                        children='Include Link?'/>
                </div>
                <div style={{ padding: '5px', }}>
                    <input
                        type="checkbox"
                        onChange={this.handleLinkToggle.bind(this)}
                        id="includeLink" />
                </div>
            </div>
        )
    }
}

interface RefOptionsProps {
    attachInline: boolean
    citationStyle: string
    eventHandler: Function
}

class RefOptions extends React.Component<RefOptionsProps,{}> {

    /**
     * NOTE: This fixes a strange issue where React triggers a single onChange
     *   event on the select element during initial render. No idea why it happens,
     *   however this seems to fix it.
     */
    private delayUpdate: boolean = true;

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        setTimeout(() => {
            this.delayUpdate = false;
        }, 300);
    }

    handleSelect(e: DOMEvent) {
        if (e.target.value === 'apa') {return};
        this.props.eventHandler(
            new CustomEvent(LocalEvents.CHANGE_CITATION_STYLE, {
                detail: e.target.value
            })
        );
    }

    handleToggleInlineAttachment() {
        this.props.eventHandler(
            new CustomEvent(LocalEvents.TOGGLE_INLINE_ATTACHMENT)
        );
    }

    public citationStyleText = toTitleCase(this.props.citationStyle.split('-').join(' '));

    render() {
        return (
            <div className='row'>
                <div style={{ display: 'flex', alignItems: 'center', }}>
                    <label
                        htmlFor='citationStyle'
                        children='Format'
                        style={{ padding: '5px', }} />
                    <select
                        id='citationStyle'
                        style={{ width: '100%', }}
                        onChange={this.handleSelect.bind(this)}
                        value={this.props.citationStyle} >
                        { citeStyles.map((style, i) =>
                            <option
                                key={`citation-style-${i}`}
                                value={style.value}
                                children={style.label} />
                        )}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', }}>
                    <label
                        htmlFor='attachInline'
                        style={{ padding: '5px', }}
                        children='Also add inline citation at current cursor position?' />
                    <input
                        type='checkbox'
                        id='attachInline'
                        style={{ padding: '5px', }}
                        checked={this.props.attachInline}
                        onChange={this.handleToggleInlineAttachment.bind(this)} />
                </div>
            </div>
        )
    }
}



interface ActionButtonProps {
    addManually: boolean
    eventHandler: Function
}

class ActionButtons extends React.Component<ActionButtonProps, {}> {

    constructor(props: ActionButtonProps) {
        super(props);
    }

    searchPubmedClick() {
        let wm = top.tinyMCE.activeEditor.windowManager;
        wm.open({
            title: 'Search PubMed for Reference',
            url: wm.windows[0].settings.params.baseUrl + 'pubmed-window.html',
            width: 600,
            height: 100,
            onsubmit: (e: any) => {
                this.props.eventHandler(
                    new CustomEvent(LocalEvents.PUBMED_DATA_SUBMIT, { detail: e.target.data.pmid })
                );
            }
        });
    }

    addManuallyClick() {
        this.props.eventHandler(
            new CustomEvent(LocalEvents.TOGGLE_MANUAL)
        );
    }

    render() {
        return(
            <div className='row' style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
            }}>
                <input
                    id='addManually'
                    style={{ margin: '0 5px' }}
                    onClick={this.addManuallyClick.bind(this)}
                    type='button'
                    className='btn'
                    value={
                        this.props.addManually === false
                        ? 'Add Reference Manually'
                        : 'Add Reference with PMID'} />
                <input
                    id='searchPubmed'
                    style={{ margin: '0 5px' }}
                    onClick={this.searchPubmedClick.bind(this)}
                    type='button'
                    className='btn'
                    value='Search Pubmed' />
                <span style={{
                    borderRight: 'solid 2px #ccc',
                    height: 25, margin: '0 15px 0 10px',
                }} />
                <input
                    style={{ flexGrow: 1, margin: '0 15px 0 0' }}
                    type='submit'
                    className='submit-btn'
                    value='Insert Reference' />
            </div>
        )
    }

}



ReactDOM.render(
  <ReferenceWindow />,
  document.getElementById('main-container')
)