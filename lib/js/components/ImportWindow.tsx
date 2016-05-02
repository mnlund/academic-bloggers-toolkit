import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from '../utils/Modal';
import { RISParser } from '../utils/RISParser';
const citeStyles = require('../../../vendor/citationstyles');


interface DOMEvent extends React.UIEvent {
    target: HTMLInputElement
}

interface State {
    filename: string
    payload: CSL.Data[]
    format: string
    links: boolean
}

class ImportWindow extends React.Component<{}, State> {

    private modal: Modal = new Modal('Import References from RIS File');
    private wm: TinyMCE.WindowManager = top.window.tinyMCE.activeEditor.windowManager;


    constructor() {
        super();
        this.state = {
            filename: '',
            payload: [],
            format: top.tinyMCE.activeEditor.windowManager.windows[0].settings.params.preferredStyle || 'american-medical-association',
            links: true,
        }
    }

    componentDidMount() {
        this.modal.resize();
    }

    componentDidUpdate() {
        this.modal.resize();
    }

    handleFileUpload(e: DOMEvent) {

        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onload = (upload: any) => {
            let parser = new RISParser(upload.target.result);
            let payload: { [id: string]: CSL.Data } = {};

            let parsedRefs: CSL.Data[] = parser.parse();
            if (parsedRefs.length === 0) {
                this.wm.alert(`The file could not be processed. Are you sure it's a .RIS (Refman) file?`);
                return;
            }

            parsedRefs.forEach(ref => {
                payload[ref.id] = ref;
            });

            let leftovers = parser.unsupportedRefs;

            if (leftovers.length > 0) {
                this.wm.alert(`The following references were unable to be processed: ${leftovers.join(', ')}`);
            }

            this.setState(
                Object.assign({}, this.state, { payload })
            );
        }

        reader.readAsText(file);
        this.setState(
            Object.assign({}, this.state, { filename: e.target.value })
        );
    }

    handleChange(e: DOMEvent) {
        this.setState(
            Object.assign({}, this.state, {
                format: e.target.value,
            })
        );
    }

    handleClick(e: DOMEvent) {
        this.setState(
            Object.assign({}, this.state, {
                links: !this.state.links,
            })
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        let wm = top.tinyMCE.activeEditor.windowManager;
        wm.setParams({ data: this.state });
        wm.close();
    }


    render() {
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', }}>
                    <label
                        htmlFor='citeformat'
                        style={{ whiteSpace: 'nowrap', marginRight: 10 }}
                        children='Style'/>
                    <select
                        id='citeformat'
                        style={{width: '100%'}}
                        onChange={this.handleChange.bind(this)}
                        value={this.state.format} >
                            {
                                citeStyles.map((style, i: number) =>
                                    <option className='testing' key={i} value={style.value} children={style.label} />
                                )
                            }
                    </select>
                    <div>
                        <label
                            htmlFor='includeLink'
                            style={{ whiteSpace: 'nowrap', margin: '0 10px', }}
                            children='Links'/>
                        <input type='checkbox' checked={this.state.links} onChange={this.handleClick.bind(this)} />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, }}>
                        <label className='uploadLabel'>
                            <input
                                type="file"
                                required={true}
                                onChange={this.handleFileUpload.bind(this)}
                                accept='application/xresearch-info-systems'/>
                            <span children={`Choose File`} />
                        </label>
                        <div
                            style={{
                                margin: '0 10px',
                                background: '#f1f1f1',
                                border: '1px solid #ddd',
                                borderRadius: 2,
                                padding: 3,
                                color: '#444',
                                flex: 1,
                                minHeight: 20,
                            }}
                            children={this.state.filename} />
                    </div>
                    <div>
                        <input
                            type='button'
                            className='submit-btn'
                            value='Import'
                            disabled={this.state.payload.length === 0}
                            onClick={this.handleSubmit.bind(this)} />
                    </div>
                </div>
            </div>
        )
    }
}


ReactDOM.render(
    <ImportWindow />,
    document.getElementById('main-container')
);