
export function throwError(msg: string): never {
    throw new Error(msg)
}

export function timeToNanoSecs(time: string): number{
    const times = time.split(':').reverse()
    let nano = 0
    let unit = 0
    for(const t of times){
        const n = parseInt(t)
        if (isNaN(n)) {
            throwError(`${t} 不是有效的时间戳记文字。`)
        }
        nano += n * Math.pow(60, unit)
        unit++
    }

    return nano * 1000
}

export function generateToken(): string{
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}