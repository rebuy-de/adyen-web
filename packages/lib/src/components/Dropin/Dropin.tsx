import { h } from 'preact';
import UIElement from '../UIElement';
import defaultProps from './defaultProps';
import DropinComponent from '../../components/Dropin/components/DropinComponent';
import CoreProvider from '../../core/Context/CoreProvider';
import { PaymentAction } from '../../types';
import { DropinElementProps } from './types';
import { getCommonProps } from './components/utils';
import { createElements, createStoredElements } from './elements';

class DropinElement extends UIElement<DropinElementProps> {
    public static type = 'dropin';
    protected static defaultProps = defaultProps;
    public dropinRef = null;

    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.handleAction = this.handleAction.bind(this);
    }

    get isValid() {
        return !!this.dropinRef && !!this.dropinRef.state.activePaymentMethod && !!this.dropinRef.state.activePaymentMethod.isValid;
    }

    showValidation() {
        if (this.dropinRef.state.activePaymentMethod) {
            this.dropinRef.state.activePaymentMethod.showValidation();
        }

        return this;
    }

    setStatus(status, props = {}) {
        this.dropinRef?.setStatus({ type: status, props });
        if (process.env.NODE_ENV === 'test') {
            this['componentFromAction'] = props['component'];
        }
        return this;
    }

    get activePaymentMethod() {
        if (!this.dropinRef?.state && !this.dropinRef?.state.activePaymentMethod) {
            return null;
        }

        return this.dropinRef.state.activePaymentMethod;
    }

    get data() {
        if (!this.activePaymentMethod) {
            return null;
        }

        return this.dropinRef.state.activePaymentMethod.data;
    }

    /**
     * Calls the onSubmit event with the state of the activePaymentMethod
     */
    submit(): void {
        if (!this.activePaymentMethod) {
            throw new Error('No active payment method.');
        }

        this.activePaymentMethod.submit();
    }

    /**
     * Creates the Drop-in elements
     */
    private handleCreate = () => {
        const { paymentMethods, storedPaymentMethods, showStoredPaymentMethods, showPaymentMethods } = this.props;
        const commonProps = getCommonProps({ ...this.props, /*onSubmit: this.submit,*/ elementRef: this.elementRef });
        const storedElements = showStoredPaymentMethods ? createStoredElements(storedPaymentMethods, commonProps, this._parentInstance.create) : [];
        const elements = showPaymentMethods ? createElements(paymentMethods, commonProps, this._parentInstance.create) : [];

        return [storedElements, elements];
    };

    handleAction(action: PaymentAction, props = {}) {
        if (!action || !action.type) throw new Error('Invalid Action');

        if (action.type !== 'redirect' && this.activePaymentMethod?.updateWithAction) {
            return this.activePaymentMethod.updateWithAction(action);
        }

        const paymentAction: UIElement = this._parentInstance.createFromAction(action, {
            ...props,
            elementRef: this.elementRef, // maintain elementRef for 3DS2 flow
            onAdditionalDetails: this.handleAdditionalDetails,
            isDropin: true
        });

        if (paymentAction) {
            return this.setStatus(paymentAction.props.statusType, { component: paymentAction });
        }

        return null;
    }

    closeActivePaymentMethod() {
        this.dropinRef.closeActivePaymentMethod();
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <DropinComponent
                    {...this.props}
                    onChange={this.setState}
                    elementRef={this.elementRef}
                    onCreateElements={this.handleCreate}
                    ref={dropinRef => {
                        this.dropinRef = dropinRef;
                    }}
                />
            </CoreProvider>
        );
    }
}

export default DropinElement;
