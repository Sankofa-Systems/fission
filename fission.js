const {
  split,
  combine
} = require('./vendor/sss')
const {
  createHash
} = require('crypto')
const sha256 = createHash('sha256')

const splitFn = (req, res) => {
  const {
    secret,
    numShares,
    numThreshold
  } = req.body
  const secretBuffer = Buffer.from(secret, 'hex')
  const splitShares =
    split(secretBuffer, { shares: numShares, threshold: numThreshold })
      .map(shareBuffer => shareBuffer.toString('hex'))
  res.json({
    shares: splitShares,
    checksum: sha256.update(secretBuffer).digest('hex')
  })
}

const join = (req, res) => {
  const {
    checksum,
    shares
  } = req.body
  const shareBuffers = shares.map(hex => Buffer.from(hex, 'hex'))
  const joinedSecret = combine(shareBuffers)
  const joinedSecretHex = joinedSecret.toString('hex')
  const recomputedDigest = sha256.update(joinedSecret).digest('hex')
  if (checksum && recomputedDigest !== checksum) {
    res.status(400)
    res.end('Checksums did not match')
  } else {
    res.json({
      secret: joinedSecretHex
    })
  }
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    switch (req.url) {
      case '/split':
        splitFn(req, res)
        break;
      case '/join':
        join(req, res)
        break;
      default:
        res.status(400)
        res.end('Operation not supported')
        break;
    }
  } catch (err) {
    console.error(err)
    res.status(500)
    res.end()
  }
}
