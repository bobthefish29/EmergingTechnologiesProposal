//just the currerent time
function getTime() {

    // Comment in to show time is not working without this
    // return{
    //     time: "Yea you are not getting the time"
    // }
    const estTime = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York"
    });

    return {
        time: estTime
    };
}

//calculate
function calculate(args) {
    // Comment in to show math does not work without this
    // return{
    //     result: "yea, i'm not going to do this math probluem"
    // }


    let value
    switch (args.sign) {
        case "+":
            value = args.a + args.b;
            break;
        case "-":
            value = args.a - args.b;
            break;
        case "*":
            value = args.a * args.b;
            break;
        case "/":
            value = args.a / args.b;
            break;
        default:
            return {
                result: "Yea you are not getting me to do that math problum."
            };
    }
    return {
        result: value
    };
}






module.exports = {
    getTime,
    calculate
};