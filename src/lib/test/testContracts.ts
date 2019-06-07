import { Contract } from '../../core'

type ContractReference = {
  address: Contract['address']
  graphQLSchema: Contract['bundle']['graphQlSchema']
  executable: Contract['bundle']['executable']
  location: string
  bundle: string
}

export const testContracts: ContractReference[] = [{
  address: 'testContract',
  graphQLSchema: require('../../../test/bundles/testContract/graphQlSchema'),
  executable: 'samjeston/smart_contract_server_mock',
  location: 'http://testContractBundle',
  bundle: 'H4sIAIq061wAA+1YbWvbMBDe5/wKkS9NoGSyHcdLoINuY9DBupeOfRmjyPY5cWtLQZJLy8h/nyy7qV9iN4O13YseQmzfnU535ztZpxQkmVwIRp89HDDGs+kU5Vdv5uortotnDQfPkOVMPdvDtmtZCFu25+FnCD+gTVtkQhKuTPm8uhF9ckosinr4hStoe/1L8GOA0BDoMqYwXKChkJk/PNS0awgySfwEvtysNS9kwSXwgrsiYpXTwI68Obj+DDsO9n0yDewX8/nMth3Ln/nEnrteiH1rCl4IvmNZeGp56oUH3jwEMnPcQluh+SQlS/gMayZiyfiNNoekFyAko89FSrg8DxiVnATyXAC/An6eqoHDwWbw1FH8e7HkZL36lJwFK0jzheAh5rin/r2Z55X1b9sudlX9T23XMfX/GEhZmCUwges141KgIxRlNJAxo2iki40lCfAxypcJDjLjVN8iJNWi8AYisSifVRVfxjTMi/YNC7IUqNS1rTkhRDGNc61CCXwryWg7tDb8g38BgfxS6C+HbVVpSUrSfEGqjq6MP825h3XeFUkyvYZ9ykCtLBXmpqY5phJ4RALQdn6v8cKYK7viq128KIYkrPvW9K9m49tcvsO9bhfvc7Puql7KG/xNayLCl/pltZ3SbFms/X12MHqaJYn+SOwwp1NBw5WwQ0FfLPaJh5bZxuQVYwkQ2gxLjk2L1qS0g9dIiRq7OvqOU9Hx+Mn/Xn3PtcL/Iv9JGP5i+reU9WbtCV1n8ms+W48j/c7s41DdKZqlPnBrZwLvnLun/vYu4vsV7V3MWrQ3Hi1lnXqqcTlRn5sOsXZhd1F3R7CvyDtG/al5Y5u8KeRM3uyZN4zHqjUkqh/7eGmSp5DbBudM8pgunyx/GpR/fvPWHe5H2ruVd9tADxMW1Hwb5r2kVCR8N90QtIsWfjGoqikN4iBYcgW80kfpFqWqNd/Ij8a1EJatmOQZtMzbunq73avqUpsiNDo/RGrfI+oqVbcnJPqByh3GYXljo41qCnPxlmys/nhWNItHjTecglyxcIEO1IQH9djfnuEch6HyXjl+IEHI1yW1IVzoOb7dpS12GlgfUl2yFtrySZVU3fu2I3rX806KAzAYVdwc1yaayBXQkfIBHb1sJXgeItVrTBK2zEXGDXY53buzD6cTofM6jm7agptx+/UObv83v+Pg6+6Y7zccJnTgvvNfjJ3i/Me11Q8jbDk2ds35z2Pg9PnxU5tgYGBgYGBgYGBgYGBgYGDwwPgJ292KoAAoAAA='
}]
