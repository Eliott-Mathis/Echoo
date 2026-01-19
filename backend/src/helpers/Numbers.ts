export const numberGenerator = (length: number) => {
    let nb =""
    for(let i = 0; i < length; i++){
        nb += Math.floor((Math.random() - 0.01) * 10)
    }

    return nb;
}