export default class Error{

    public static db(): string{
        return 'Error with DB';
    }

    public static notFound(obj: string): string{
        return `${obj} has not beed founded`;
    }

    public static dataNotSended(obj: string): string{
        return `Data about '${obj}' has not been sended`;
    }
}