import { h } from 'preact';
import UIElement from '../UIElement';
import { UIElementProps } from '../types';
import IssuerList from '../internal/IssuerList';
import getIssuerImageUrl from '../../utils/get-issuer-image';
import { FALLBACK_CONTEXT } from '../../core/config';
import CoreProvider from '../../core/Context/CoreProvider';
import Language from '../../language/Language';
import { IssuerItem } from '../internal/IssuerList/types';

interface IssuerListContainerProps extends UIElementProps {
    showImage?: boolean;
    placeholder?: string;
    issuers?: IssuerItem[];
    highlightedIssuers: string[];
    i18n: Language;
    loadingContext: string;
}

interface IssuerListData {
    paymentMethod: {
        type: string;
        issuer: string;
    };
}

class IssuerListContainer extends UIElement<IssuerListContainerProps> {
    constructor(props: IssuerListContainerProps) {
        super(props);

        if (this.props.showImage) {
            const getIssuerIcon = getIssuerImageUrl({ loadingContext: this.props.loadingContext }, this.constructor['type']);

            this.props.issuers = this.props.issuers.map(item => ({
                ...item,
                icon: getIssuerIcon(item.id)
            }));
        }
    }

    protected static defaultProps = {
        showImage: true,
        onValid: () => {},
        issuers: [],
        highlightedIssuers: [],
        loadingContext: FALLBACK_CONTEXT
    };

    formatProps(props) {
        const issuers = (props.details && props.details.length && (props.details.find(d => d.key === 'issuer') || {}).items) || props.issuers || [];
        return { ...props, issuers };
    }

    /**
     * Formats the component data output
     */
    formatData(): IssuerListData {
        return {
            paymentMethod: {
                type: this.constructor['type'],
                issuer: this.state?.data?.issuer
            }
        };
    }

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        return !!this.state?.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <IssuerList
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    items={this.props.issuers}
                    highlightedIds={this.props.highlightedIssuers}
                    {...this.props}
                    {...this.state}
                    onChange={this.setState}
                    onSubmit={this.submit}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default IssuerListContainer;
