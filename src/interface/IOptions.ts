import ITimeSpans from "./ITimeSpans";
import IClosing from "./IClosing";
import ILanguage from "./ILanguage";

interface IOptions {
	locale: string;
	timezone: string;
	openings: ITimeSpans;
	closings: Array<IClosing>;
	language: ILanguage;
}

export default IOptions;
